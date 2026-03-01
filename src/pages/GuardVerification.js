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

  // Load guardian details when student is identified
  useEffect(() => {
    if (studentInfo && studentInfo.guardianId) {
      const loadGuardian = async () => {
        try {
          const result = await window.electron.getGuardianById(studentInfo.guardianId);
          if (result && result.success) {
            setGuardianInfo(result.data);
          }
        } catch (err) {
          console.error('[GuardVerification] Error loading guardian:', err);
        }
      };
      loadGuardian();
    } else {
      setGuardianInfo(null);
    }
  }, [studentInfo]);

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
              console.log('Guardian barcode scanned:', decodedText);
              scanner.clear();
              setGuardianMode('choice');
              scannerRef.current = null;
              setGuardianBarcode(decodedText);
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

      // Call face-based guardian verification
      const result = await window.electron.verifyGuardianByFace(studentInfo.id, descriptor, 0.6);

      if (!result.success) {
        setError(result.error || 'Failed to verify guardian');
        setGuardianMode('choice');
        return;
      }

      const { data } = result;
      setVerificationResult(data);
      setGuardianMode('choice');

      if (data.verified) {
        setSuccess(`✓ ${data.message}`);
      } else {
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
  const verifyGuardianBarcode = async () => {
    if (!studentInfo || !guardianBarcode) {
      setError('Please scan both student and guardian barcodes');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await window.electron.verifyGuardian(studentInfo.id, guardianBarcode);
      if (result.success) {
        setVerificationResult(result.data);
        if (result.data.isMatch) {
          setSuccess('✓ Guardian verified successfully!');
        } else {
          setError('✗ Guardian does not match student record!');
        }
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (err) {
      setError('Error during verification: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setStudentInfo(null);
    setGuardianBarcode('');
    setVerificationResult(null);
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
              {verificationMode === 'barcode' && (
                <>
                  <div id="qr-scanner" className="scanner-container"></div>
                  <button
                    className="btn btn-secondary mt-10"
                    onClick={() => setVerificationMode('choice')}
                  >
                    ← Back
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
                    <span className="label">Match Distance:</span>
                    <span className="value mono" style={{ color: '#28a745' }}>{verificationResult.distance.toFixed(4)}</span>
                  </div>
                )}
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
                {guardianInfo && (
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

      {/* Verification Result */}
      {verificationResult && (
        <div className={`verification-result ${isVerified ? 'success' : 'failure'}`}>
          <div className="result-icon">
            {isVerified ? '✓' : '✗'}
          </div>
          <h3>{verificationResult.message}</h3>

          {isVerified && verificationResult.guardian && (
            <div className="guardian-details" style={{ marginTop: '10px', textAlign: 'left' }}>
              <p><strong>Guardian:</strong> {verificationResult.guardian.firstName} {verificationResult.guardian.lastName}</p>
              <p><strong>Barcode:</strong> <span className="mono">{verificationResult.guardian.barcode}</span></p>
              {verificationResult.guardian.relationship && (
                <p><strong>Relationship:</strong> {verificationResult.guardian.relationship}</p>
              )}
              {verificationResult.guardian.contactNumber && (
                <p><strong>Contact:</strong> {verificationResult.guardian.contactNumber}</p>
              )}
            </div>
          )}

          {verificationResult.distance !== null && (
            <div className="result-details">
              <p className="distance-metric">Match Distance: {verificationResult.distance?.toFixed(4)}</p>
            </div>
          )}

          {/* restart button inside result panel */}
          <div className="result-actions" style={{ marginTop: '15px' }}>
            <button className="btn btn-primary btn-small" onClick={resetVerification}>
              ↻ New Verification
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {studentInfo && guardianBarcode && !verificationResult && (
        <div className="action-buttons">
          <button
            className="btn btn-success btn-large"
            onClick={verifyGuardianBarcode}
            disabled={loading}
          >
            {loading ? 'Verifying...' : '✓ Verify Guardian (Barcode)'}
          </button>
        </div>
      )}

      {verificationResult && (
        <div className="action-buttons">
          <button className="btn btn-primary btn-large" onClick={resetVerification}>
            ↻ Start New Verification
          </button>
        </div>
      )}
    </div>
  );
}

export default GuardVerification;
