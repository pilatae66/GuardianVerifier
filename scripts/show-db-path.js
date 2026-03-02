/**
 * Script to show where the Electron app stores its database
 * Run with: node scripts/show-db-path.js
 */

const path = require('path');
const os = require('os');

// Simulate Electron's userData path calculation
function getElectronUserDataPath() {
  const home = os.homedir();
  let userDataPath;
  
  if (process.platform === 'win32') {
    // Windows: C:\Users\<user>\AppData\Roaming\<app-name>
    userDataPath = path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'guardian-verifier-system');
  } else if (process.platform === 'darwin') {
    // macOS: ~/Library/Application Support/<app-name>
    userDataPath = path.join(home, 'Library', 'Application Support', 'guardian-verifier-system');
  } else {
    // Linux: ~/.config/<app-name>
    userDataPath = path.join(home, '.config', 'guardian-verifier-system');
  }
  
  return userDataPath;
}

const userDataPath = getElectronUserDataPath();
const dbPath = path.join(userDataPath, 'guardian-system.db');

console.log('\n=== Guardian Verifier System Database Location ===\n');
console.log('Platform:', process.platform);
console.log('User Data Directory:', userDataPath);
console.log('Database File:', dbPath);
console.log('\n');
console.log('To view the database:');
console.log('1. Navigate to the user data directory');
console.log('2. Open guardian-system.db with an SQLite viewer');
console.log('\nNote: The app name in the path depends on your package.json "name" field.');
console.log('If the folder doesn\'t exist yet, run the app once to create it.');
console.log('\n');
