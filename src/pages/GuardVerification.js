import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './GuardVerification.css';

function GuardVerification() {
  const [scanning, setScanning] = useState(false);
  const [scanningGuardian, setScanningGuardian] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [guardianBarcode, setGuardianBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanning && scannerRef.current === null) {
      // Use setTimeout to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        const scannerElement = document.getElementById('qr-scanner');
        console.log('Scanner element:', scannerElement);
        if (scannerElement) {
          const scanner = new Html5QrcodeScanner('qr-scanner', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          });

          scanner.render(
            async (decodedText) => {
              console.log('Barcode scanned:', decodedText);
              scanner.clear();
              setScanning(false);
              scannerRef.current = null;
              await handleStudentScan(decodedText);
            },
            (error) => {
              console.warn('Scanner error:', error);
            }
          );

          scannerRef.current = scanner;
          console.log('Scanner initialized');
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (scannerRef.current && !scanning) {
        try {
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (err) {
          console.warn('Error clearing scanner:', err);
        }
      }
    };
  }, [scanning]);

  const startScanning = () => {
    setScanning(true);
    setError('');
  };

  const handleStudentScan = async (barcode) => {
    console.log('handleStudentScan called with barcode:', barcode);
    setLoading(true);
    try {
      console.log('Calling window.electron.getStudentByBarcode');
      const result = await window.electron.getStudentByBarcode(barcode);
      console.log('Result:', result);
      if (result.success && result.data) {
        setStudentInfo(result.data);
        setGuardianBarcode('');
        setVerificationResult(null);
      } else if (result.success && !result.data) {
        alert('No student found with this barcode. Please register the student first.');
      } else {
        alert(result.error || 'Student not found in system');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error scanning student barcode: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardianScan = () => {
    setScanningGuardian(true);
  };

  useEffect(() => {
    if (scanningGuardian && scannerRef.current === null) {
      const timer = setTimeout(() => {
        const scannerElement = document.getElementById('guardian-scanner');
        console.log('Guardian scanner element:', scannerElement);
        if (scannerElement) {
          const scanner = new Html5QrcodeScanner('guardian-scanner', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          });

          scanner.render(
            async (decodedText) => {
              console.log('Guardian barcode scanned:', decodedText);
              scanner.clear();
              setScanningGuardian(false);
              scannerRef.current = null;
              setGuardianBarcode(decodedText);
            },
            (error) => {
              console.warn('Guardian scanner error:', error);
            }
          );

          scannerRef.current = scanner;
          console.log('Guardian scanner initialized');
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (scannerRef.current && !scanningGuardian) {
        try {
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (err) {
          console.warn('Error clearing guardian scanner:', err);
        }
      }
    };
  }, [scanningGuardian]);

  const verifyGuardian = async () => {
    if (!studentInfo || !guardianBarcode) {
      setError('Please scan both student and guardian barcodes');
      return;
    }

    setLoading(true);
    setError('');
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
  };

  return (
    <div className="verify-container">
      <div className="verify-header">
        <h1>Guardian Verification</h1>
        <p>Scan student and guardian barcodes to verify relationship</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="verify-grid">
        {/* Student Scan Section */}
        <div className="verify-section">
          <h2>Step 1: Scan Student Barcode</h2>
          {!studentInfo ? (
            <>
              {scanning && <div id="qr-scanner" className="scanner-container"></div>}
              {!scanning && (
                <button className="btn btn-primary btn-large" onClick={startScanning}>
                  📷 Start Scanning Student
                </button>
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
                      <span>📷</span>
                      <p>No Photo</p>
                    </div>
                  )}
                </div>
                <div className="guardian-photo">
                  {studentInfo.guardianPhoto ? (
                    <img src={studentInfo.guardianPhoto} alt="Guardian" className="photo" />
                  ) : (
                    <div className="photo-placeholder">
                      <span>📷</span>
                      <p>Guardian Photo</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{studentInfo.firstName} {studentInfo.lastName}</span>
              </div>
              <div className="info-row">
                <span className="label">Barcode:</span>
                <span className="value">{studentInfo.barcode}</span>
              </div>
              <div className="info-row">
                <span className="label">Guardian:</span>
                <span className="value">{studentInfo.guardianFirstName} {studentInfo.guardianLastName}</span>
              </div>
              <button
                className="btn btn-secondary btn-small mt-20"
                onClick={() => setStudentInfo(null)}
              >
                Change Student
              </button>
            </div>
          )}
        </div>

        {/* Guardian Scan Section */}
        {studentInfo && (
          <div className="verify-section">
            <h2>Step 2: Scan Guardian Barcode</h2>
            {!guardianBarcode ? (
              <>
                {scanningGuardian && <div id="guardian-scanner" className="scanner-container"></div>}
                {!scanningGuardian && (
                  <button className="btn btn-primary btn-large" onClick={handleGuardianScan}>
                    📷 Start Scanning Guardian
                  </button>
                )}
              </>
            ) : (
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
          </div>
        )}
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className={`verification-result ${verificationResult.isMatch ? 'success' : 'failure'}`}>
          <div className="result-icon">
            {verificationResult.isMatch ? '✓' : '✗'}
          </div>
          <h3>{verificationResult.message}</h3>
          <div className="result-details">
            <div className="detail-section">
              <h4>Student</h4>
              <div className="detail-photo">
                {verificationResult.student.photo ? (
                  <img src={verificationResult.student.photo} alt="Student" className="photo" />
                ) : (
                  <div className="photo-placeholder-small">
                    <span>📷</span>
                  </div>
                )}
              </div>
              <p>{verificationResult.student.firstName} {verificationResult.student.lastName}</p>
            </div>
            <div className="detail-section">
              <h4>Guardian</h4>
              <div className="detail-photo">
                {verificationResult.guardian.photo ? (
                  <img src={verificationResult.guardian.photo} alt="Guardian" className="photo" />
                ) : (
                  <div className="photo-placeholder-small">
                    <span>📷</span>
                  </div>
                )}
              </div>
              <p>{verificationResult.guardian.firstName} {verificationResult.guardian.lastName}</p>
            </div>
            {verificationResult.guardian.contactNumber && (
              <div className="detail-section">
                <h4>Contact</h4>
                <p>{verificationResult.guardian.contactNumber}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {studentInfo && guardianBarcode && !verificationResult && (
        <div className="action-buttons">
          <button
            className="btn btn-success btn-large"
            onClick={verifyGuardian}
            disabled={loading}
          >
            {loading ? 'Verifying...' : '✓ Verify Guardian'}
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
