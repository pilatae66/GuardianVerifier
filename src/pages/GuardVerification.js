import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import * as FaceUtil from '../utils/face';
import './GuardVerification.css';

function GuardVerification() {
  // UI state
  const [verificationMode, setVerificationMode] = useState('choice'); // choice, face, barcode
  const [scanningGuardian, setScanningGuardian] = useState(false);
  const [guardianMode, setGuardianMode] = useState('choice'); // choice, face, barcode
  
  // Data state
  const [studentInfo, setStudentInfo] = useState(null);
  const [guardianInfo, setGuardianInfo] = useState(null);
  const [guardianBarcode, setGuardianBarcode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  // track how student was identified so we can control guardian display
  const [identMethod, setIdentMethod] = useState(null); // 'face' or 'barcode'
  
  // Loading/UI feedback state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState('');
  
  // Refs
  const scannerRef = useRef(null);
  const modelsLoadedRef = useRef(false);
  // Normalized verification flag (supports both `verified` from face flow
  // and `isMatch` from barcode flow)
  const isVerified = verificationResult ? (verificationResult.verified ?? verificationResult.isMatch ?? false) : false;

  // Initialize face models on component mount
  useEffect(() => {
    const initializeModels = async () => {
      if (modelsLoadedRef.current) return;
      
      try {
        console.log('[GuardVerification] Initializing face recognition models...');
        await FaceUtil.loadModels();
        modelsLoadedRef.current = true;
        setModelsLoaded(true);
        console.log('[GuardVerification] Face models loaded successfully');
      } catch (err) {
        console.warn('[GuardVerification] Face models unavailable:', err.message);
      setModelsLoaded(false);
      // the error may be due to missing model files or TF backend initialization
      // user-facing message will show if attempting a scan later
      }
    };

    initializeModels();

    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (err) {
          console.warn('Error clearing scanner:', err);
        }
      }
    };
  }, []);

  // Load guardian details when student is identified via face (hide for barcode until guardian verified)
  useEffect(() => {
    if (studentInfo && studentInfo.guardianId && identMethod === 'face') {
      const loadGuardian = async () => {
        try {
          const result = await window.electron.getGuardianById(studentInfo.guardianId);
          if (result && result.success) {
            console.debug('[GuardVerification] loaded guardian for student:', result.data);
            setGuardianInfo(result.data);
          }
        } catch (err) {
          console.error('[GuardVerification] Error loading guardian:', err);
        }
      };
      loadGuardian();
    } else {
      // clear guardian info unless verification later populates it
      setGuardianInfo(null);
    }
  }, [studentInfo, identMethod]);

  // Debug: watch guardianInfo changes
  useEffect(() => {
    console.debug('[GuardVerification] guardianInfo changed:', guardianInfo, 'verificationResult:', verificationResult);
  }, [guardianInfo, verificationResult]);

  // Barcode scanner effect for student scan
  useEffect(() => {
    if (verificationMode === 'barcode' && scannerRef.current === null) {
      const timer = setTimeout(() => {
        const scannerElement = document.getElementById('qr-scanner');
        if (scannerElement) {
          const scanner = new Html5QrcodeScanner('qr-scanner', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          });

          scanner.render(
            async (decodedText) => {
              console.log('Barcode scanned:', decodedText);
              scanner.clear();
              setVerificationMode('choice');
              scannerRef.current = null;
              await handleStudentBarcode(decodedText);
            },
            (error) => {
              // ignore frequent NotFoundException when no code is in view
              if (error && error.name && error.name.includes('NotFoundException')) {
                return;
              }
              console.warn('Scanner error:', error);
            }
          );

          scannerRef.current = scanner;
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (scannerRef.current && verificationMode !== 'barcode') {
        try {
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (err) {
          console.warn('Error clearing scanner:', err);
        }
      }
    };
  }, [verificationMode]);

  // Guardian barcode scanner effect
  useEffect(() => {
    if (guardianMode === 'barcode' && scannerRef.current === null) {
      const timer = setTimeout(() => {
        const scannerElement = document.getElementById('guardian-scanner');
        if (scannerElement) {
          const scanner = new Html5QrcodeScanner('guardian-scanner', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          });

          scanner.render(
            async (decodedText) => {
              console.log('[GuardVerification] Guardian barcode scanned:', decodedText);
              console.log('[GuardVerification] Current guardianMode:', guardianMode);
              console.log('[GuardVerification] Setting guardianBarcode state');
              scanner.clear();
              setGuardianMode('choice');
              scannerRef.current = null;
              setGuardianBarcode(decodedText);
              console.log('[GuardVerification] After setGuardianBarcode, should be:', decodedText);
              // automatically start verification if the student has already been identified
              if (studentInfo) {
                console.log('[GuardVerification] auto-triggering verifyGuardianBarcode due to scan');
                // pass decodedText directly to avoid race with React state
                verifyGuardianBarcode(decodedText);
              }
            },
            (error) => {
              console.warn('Guardian scanner error:', error);
            }
          );

          scannerRef.current = scanner;
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (scannerRef.current && guardianMode !== 'barcode') {
        try {
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (err) {
          console.warn('Error clearing guardian scanner:', err);
        }
      }
    };
  }, [guardianMode]);

  // Student identification via face scan
  const handleStudentFaceScan = async () => {
    setLoading(true);
    setError('');
    setFaceDetectionStatus('');

    try {
      console.log('[GuardVerification] Starting student face capture...');
      setFaceDetectionStatus('Initializing camera...');
      
      const descriptor = await FaceUtil.getDescriptorFromCamera(15000, 0.5);

      if (!descriptor) {
        setFaceDetectionStatus('No face captured');
        return;
      }

      setFaceDetectionStatus('Identifying student...');
      console.log('[GuardVerification] Face captured, identifying student...');

      // Call face-based student identification
      const result = await window.electron.findStudentByFace(descriptor, 0.6);

      if (!result.success) {
        setError(result.error || 'Failed to identify student');
        setVerificationMode('choice');
        return;
      }

      const { data } = result;
      if (data.success && data.student) {
        console.log('[GuardVerification] Student identified:', data.student);
        setStudentInfo(data.student);
        setIdentMethod('face');
        setSuccess(`✓ Student identified: ${data.student.firstName} ${data.student.lastName}`);
        setVerificationMode('choice');
      } else {
        setError(data.message || 'No matching student found. Please try again or use manual lookup.');
        setVerificationMode('choice');
      }
    } catch (err) {
      console.error('[GuardVerification] Face capture error:', err);
      
      // Determine specific error type
      if (err.message.includes('denied')) {
        setError('Camera access denied. Please grant camera permissions.');
      } else if (err.message.includes('timeout')) {
        setError('Face detection timeout. Ensure good lighting and try again.');
      } else if (err.message.includes('no camera')) {
        setError('No camera found. Please connect a camera or use barcode scanning.');
      } else {
        setError(`Face capture failed: ${err.message}`);
      }
      setVerificationMode('choice');
    } finally {
      setLoading(false);
      setFaceDetectionStatus('');
    }
  };

  // Student identification via barcode
  const handleStudentBarcode = async (barcode) => {
    setLoading(true);
    try {
      const result = await window.electron.getStudentByBarcode(barcode);
      if (result.success && result.data) {
        setStudentInfo(result.data);
        setIdentMethod('barcode');
        setSuccess(`✓ Student loaded: ${result.data.firstName} ${result.data.lastName}`);
      } else {
        setError('No student found with this barcode. Please register first.');
      }
    } catch (err) {
      setError('Error scanning barcode: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Guardian verification via face scan
  const handleGuardianFaceScan = async () => {
    if (!studentInfo) {
      setError('Please identify student first');
      return;
    }

    setLoading(true);
    setError('');
    setFaceDetectionStatus('');

    try {
      console.log('[GuardVerification] Starting guardian face capture...');
      setFaceDetectionStatus('Initializing camera...');
      
      const descriptor = await FaceUtil.getDescriptorFromCamera(15000, 0.5);

      if (!descriptor) {
        setFaceDetectionStatus('No face captured');
        return;
      }

      setFaceDetectionStatus('Verifying guardian...');
      console.log('[GuardVerification] Guardian face captured, verifying...');
      console.debug('[GuardVerification] Descriptor length:', descriptor ? descriptor.length : 'null');
      console.debug('[GuardVerification] Student ID:', studentInfo.id);

      // Call face-based guardian verification
      console.debug('[GuardVerification] About to call verifyGuardianByFace IPC...');
      let result;
      try {
        result = await window.electron.verifyGuardianByFace(studentInfo.id, descriptor, 0.6);
        console.debug('[GuardVerification] IPC call returned, result:', result);
      } catch (ipcErr) {
        console.error('[GuardVerification] IPC call threw error:', ipcErr);
        throw ipcErr;
      }

      if (!result.success) {
        console.error('[GuardVerification] guardian verify IPC returned error', result);
        setError(result.error || 'Failed to verify guardian');
        setGuardianMode('choice');
        return;
      }

      const { data } = result;
      setVerificationResult(data);
      // ensure Step 2 shows the returned guardian details immediately
      if (data && data.guardian) {
        console.debug('[GuardVerification] setting guardianInfo from face result:', data.guardian);
        setGuardianInfo(data.guardian);
      } else {
        console.debug('[GuardVerification] face result had no guardian object', data);
      }
      setGuardianMode('choice');

      if (data.verified) {
        setSuccess(`✓ ${data.message}`);
      } else {
        console.log('[GuardVerification] guardian verification result (face):', data);
        setError(`✗ ${data.message}`);
      }
    } catch (err) {
      console.error('[GuardVerification] Guardian face verification error:', err);
      
      if (err.message.includes('denied')) {
        setError('Camera access denied. Please grant camera permissions.');
      } else if (err.message.includes('timeout')) {
        setError('Face detection timeout. Ensure good lighting and try again.');
      } else {
        setError(`Guardian verification failed: ${err.message}`);
      }
      setGuardianMode('choice');
    } finally {
      setLoading(false);
      setFaceDetectionStatus('');
    }
  };

  // Verify using barcode (existing flow)
  // `overrideBarcode` allows callers (e.g. auto-trigger after scan) to pass the
  // value directly instead of relying on the React state, which may not have
  // updated yet due to batching. If no override is provided we fall back to the
  // `guardianBarcode` state value.
  const verifyGuardianBarcode = async (overrideBarcode) => {
    console.log('[GuardVerification.verifyGuardianBarcode] Called');
    console.log('[GuardVerification.verifyGuardianBarcode] studentInfo:', studentInfo);

    const code = overrideBarcode !== undefined ? overrideBarcode : guardianBarcode;
    console.log('[GuardVerification.verifyGuardianBarcode] using barcode:', code);
    console.log('[GuardVerification.verifyGuardianBarcode] verificationResult:', verificationResult);

    if (!studentInfo) {
      console.error('[GuardVerification.verifyGuardianBarcode] Missing student information');
      setError('Please identify a student first');
      return;
    }

    // we intentionally do **not** short‑circuit when `code` is falsy so that the
    // database layer can record the attempt and provide us with the proper
    // failure message.  It will throw an error which we catch below.
    setLoading(true);
    setError('');
    setSuccess('');

    // determine whether we need to override the final message
    const userMessageForMissing = !code ? 'Please scan both student and guardian barcodes' : null;

    try {
      console.log('[GuardVerification.verifyGuardianBarcode] Calling window.electron.verifyGuardian...');
      const result = await window.electron.verifyGuardian(studentInfo.id, code);
      console.log('[GuardVerification.verifyGuardianBarcode] Result received:', result);
      console.log('[GuardVerification.verifyGuardianBarcode] Result type:', typeof result);
      console.log('[GuardVerification.verifyGuardianBarcode] Result.success:', result?.success);
      
      if (result && result.success) {
        console.log('[GuardVerification.verifyGuardianBarcode] Verification succeeded, isMatch:', result.data?.isMatch);
        setVerificationResult(result.data);
        // ensure Step 2 shows the returned guardian details immediately
        if (result.data && result.data.guardian) {
          console.debug('[GuardVerification.verifyGuardianBarcode] setting guardianInfo from barcode result:', result.data.guardian);
          setGuardianInfo(result.data.guardian);
        } else {
          console.debug('[GuardVerification.verifyGuardianBarcode] barcode result had no guardian object', result.data);
        }
        if (result.data.isMatch) {
          console.log('[GuardVerification.verifyGuardianBarcode] Guardian MATCHED');
          setSuccess('✓ Guardian verified successfully!');
        } else {
          console.log('[GuardVerification.verifyGuardianBarcode] guardian verification result (barcode) - MISMATCH:', result.data);
          setError('✗ Guardian does not match student record!');
        }
      } else if (result && !result.success) {
        console.error('[GuardVerification.verifyGuardianBarcode] Verification failed, error:', result.error);
        const errorMsg = result.error || 'Verification failed. Guardian barcode could not be verified.';
        console.log('[GuardVerification.verifyGuardianBarcode] Setting error message:', errorMsg);
        setError(userMessageForMissing || errorMsg);
      } else {
        console.error('[GuardVerification.verifyGuardianBarcode] Unexpected result structure:', result);
        setError(userMessageForMissing || 'Unexpected error during verification');
      }
    } catch (err) {
      console.error('[GuardVerification.verifyGuardianBarcode] Exception thrown:', err);
      // always prefer the friendly message if we set it earlier
      if (userMessageForMissing) {
        setError(userMessageForMissing);
      } else {
        setError('Error during verification: ' + (err.message || String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setStudentInfo(null);
    setGuardianBarcode('');
    setVerificationResult(null);
    setGuardianInfo(null);
    setError('');
    setSuccess('');
    setVerificationMode('choice');
    setGuardianMode('choice');
  };

  return (
    <div className="verify-container">
      <div className="verify-header">
        <h1>Guardian Verification</h1>
        <p>{modelsLoaded ? '🟢' : '🟡'} {modelsLoaded ? 'Face recognition ready' : 'Face recognition unavailable - using barcode mode'}</p>
      </div>

      {faceDetectionStatus && <div className="alert alert-info">⏳ {faceDetectionStatus}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="verify-grid">
        {/* Student Identification Section */}
        <div className="verify-section">
          <h2>Step 1: Identify Student</h2>
          {!studentInfo ? (
            <>
              {verificationMode === 'choice' && (
                <div className="mode-selection">
                  <button
                    className="btn btn-primary btn-large"
                    onClick={handleStudentFaceScan}
                    disabled={!modelsLoaded || loading}
                    title={!modelsLoaded ? 'Face recognition models not loaded' : ''}
                  >
                    👤 Face Scan
                  </button>
                  <p>or</p>
                  <button
                    className="btn btn-secondary btn-large"
                    onClick={() => setVerificationMode('barcode')}
                    disabled={loading}
                  >
                    📋 Barcode Scan (Fallback)
                  </button>
                </div>
              )}
              {(verificationMode === 'face-student') && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
                    ⏳ {faceDetectionStatus || 'Initializing camera...'}
                  </p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setVerificationMode('barcode')}
                    disabled={loading}
                  >
                    📋 Switch to Barcode
                  </button>
                </div>
              )}
              {verificationMode === 'barcode' && (
                <>
                  <div id="qr-scanner" className="scanner-container"></div>
                  <button
                    className="btn btn-secondary mt-10"
                    onClick={() => setVerificationMode('choice')}
                  >
                    ← Back to Face Scan
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="student-info card">
              <h3>Student Information</h3>
              <div className="photos-container">
                <div className="student-photo">
                  {studentInfo.photo ? (
                    <img src={studentInfo.photo} alt="Student" className="photo" />
                  ) : (
                    <div className="photo-placeholder">
                      <span>👤</span>
                      <p>No Photo</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{studentInfo.firstName} {studentInfo.lastName}</span>
              </div>
              <div className="info-row">
                <span className="label">DOB:</span>
                <span className="value">{studentInfo.dateOfBirth}</span>
              </div>
              <div className="info-row">
                <span className="label">Barcode:</span>
                <span className="value mono">{studentInfo.barcode}</span>
              </div>
              <button
                className="btn btn-secondary btn-small mt-20"
                onClick={() => setStudentInfo(null)}
              >
                ← Change Student
              </button>
            </div>
          )}
        </div>

        {/* Guardian Verification Section */}
        {studentInfo && (
          <div className="verify-section">
            <h2>Step 2: Verify Guardian</h2>
            
            {verificationResult && verificationResult.verified && verificationResult.guardian ? (
              <div className="guardian-info card" style={{ backgroundColor: '#d4edda', borderLeft: '4px solid #28a745' }}>
                <h3 style={{ color: '#28a745' }}>✓ Guardian Verified</h3>
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">{verificationResult.guardian.firstName} {verificationResult.guardian.lastName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Barcode:</span>
                  <span className="value mono">{verificationResult.guardian.barcode}</span>
                </div>
                {verificationResult.guardian.relationship && (
                  <div className="info-row">
                    <span className="label">Relationship:</span>
                    <span className="value">{verificationResult.guardian.relationship}</span>
                  </div>
                )}
                {verificationResult.guardian.contactNumber && (
                  <div className="info-row">
                    <span className="label">Contact:</span>
                    <span className="value">{verificationResult.guardian.contactNumber}</span>
                  </div>
                )}
                {verificationResult.distance !== null && (
                  <div className="info-row" style={{ borderTop: '1px solid #c3e6cb', paddingTop: '10px', marginTop: '10px' }}>
                    <span className="label">Match Percentile:</span>
                    <span className="value mono" style={{ color: '#28a745' }}>{((1 - verificationResult.distance) * 100).toFixed(1)}%</span>
                  </div>
                )}
                <div style={{ marginTop: '15px' }}>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={resetVerification}>
                    ↻ New Verification
                  </button>
                </div>
              </div>
            ) : verificationResult && !verificationResult.verified ? (
              <div className="guardian-info card" style={{ backgroundColor: '#f8d7da', borderLeft: '4px solid #dc3545' }}>
                <h3 style={{ color: '#dc3545' }}>✗ Verification Failed</h3>
                <p style={{ marginBottom: '15px' }}>{verificationResult.message}</p>
                {verificationResult.distance !== null && (
                  <div className="info-row">
                    <span className="label">Distance:</span>
                    <span className="value mono" style={{ color: '#dc3545' }}>{verificationResult.distance.toFixed(4)}</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {guardianInfo && (verificationResult && verificationResult.verified) && (
                  <div className="guardian-info card">
                    <h3>Expected Guardian</h3>
                    <div className="info-row">
                      <span className="label">Name:</span>
                      <span className="value">{guardianInfo.firstName} {guardianInfo.lastName}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Barcode:</span>
                      <span className="value mono">{guardianInfo.barcode}</span>
                    </div>
                    {guardianInfo.relationship && (
                      <div className="info-row">
                        <span className="label">Relationship:</span>
                        <span className="value">{guardianInfo.relationship}</span>
                      </div>
                    )}
                    {guardianInfo.contactNumber && (
                      <div className="info-row">
                        <span className="label">Contact:</span>
                        <span className="value">{guardianInfo.contactNumber}</span>
                      </div>
                    )}
                  </div>
                )}
                
{!guardianBarcode && guardianMode === 'choice' && (
              <div className="mode-selection" style={{ marginTop: '15px' }}>
                <button
                  className="btn btn-primary btn-large"
                  onClick={handleGuardianFaceScan}
                  disabled={!modelsLoaded || loading}
                  title={!modelsLoaded ? 'Face recognition models not loaded' : ''}
                >
                  👤 Face Scan
                </button>
                <p>or</p>
                <button
                  className="btn btn-secondary btn-large"
                  onClick={() => setGuardianMode('barcode')}
                  disabled={loading}
                >
                  📋 Barcode Scan (Fallback)
                </button>
              </div>
            )}
            {guardianMode === 'barcode' && (
              <>
                <div id="guardian-scanner" className="scanner-container"></div>
                <button
                  className="btn btn-secondary mt-10"
                  onClick={() => setGuardianMode('choice')}
                >
                  ← Back
                </button>
              </>
            )}
            {guardianBarcode && guardianMode === 'choice' && (
              <div className="guardian-info card">
                <h3>Guardian Barcode Captured</h3>
                <div className="info-row">
                  <span className="label">Barcode:</span>
                  <span className="value mono">{guardianBarcode}</span>
                </div>
                <button
                  className="btn btn-secondary btn-small mt-20"
                  onClick={() => setGuardianBarcode('')}
                >
                  Re-scan Guardian
                </button>
              </div>
            )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {studentInfo && guardianBarcode && !verificationResult && (
        <div className="action-buttons">
          <button
            className="btn btn-success btn-large"
            onClick={() => verifyGuardianBarcode()}
            disabled={loading}
          >
            {loading ? 'Verifying...' : '✓ Verify Guardian (Barcode)'}
          </button>
        </div>
      )}
      {/* note: verification now auto-triggers after a barcode scan so user doesn't always
          need to hit the button; button remains for manual retry or fallback */}
    </div>
  );
}

export default GuardVerification;
