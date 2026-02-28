const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  registerStudent: (data) => ipcRenderer.invoke('register-student', data),
  registerGuardian: (data) => ipcRenderer.invoke('register-guardian', data),
  getStudents: () => ipcRenderer.invoke('get-students'),
  getGuardians: () => ipcRenderer.invoke('get-guardians'),
  verifyGuardian: (studentId, guardianBarcode) =>
    ipcRenderer.invoke('verify-guardian', { studentId, guardianBarcode }),
  getStudentByBarcode: (barcode) => ipcRenderer.invoke('get-student-by-barcode', barcode),
  getVerificationLogs: () => ipcRenderer.invoke('get-verification-logs'),
  // Face verification methods (new)
  findStudentByFace: (faceDescriptor, threshold = 0.6) =>
    ipcRenderer.invoke('find-student-by-face', { faceDescriptor, threshold }),
  verifyGuardianByFace: (studentId, guardianDescriptor, threshold = 0.6) =>
    ipcRenderer.invoke('verify-guardian-by-face', { studentId, guardianDescriptor, threshold }),
  printReport: (reportData) => ipcRenderer.invoke('print-report', reportData),
});
