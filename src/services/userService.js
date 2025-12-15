// User management service
// Stores users in localStorage for demo/testing purposes
// In production, this would connect to a backend database

const USERS_STORAGE_KEY = 'system_users';
const DEFAULT_USERS = {
  admins: [
    { id: 'admin1', username: 'admin', firstName: 'Admin', lastName: 'User', password: 'demo123', contactNumber: '1234567890', role: 'admin', createdAt: new Date().toISOString() }
  ],
  guards: [
    { id: 'guard1', username: 'guard', firstName: 'Guard', lastName: 'User', password: 'demo123', contactNumber: '0987654321', role: 'guard', createdAt: new Date().toISOString() }
  ]
};

// Initialize users from localStorage or use defaults
export const initializeUsers = () => {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!storedUsers) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(storedUsers);
};

// Get all users
export const getAllUsers = () => {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!storedUsers) {
    return initializeUsers();
  }
  return JSON.parse(storedUsers);
};

// Get admin users
export const getAdminUsers = () => {
  const users = getAllUsers();
  return users.admins || [];
};

// Get guard users
export const getGuardUsers = () => {
  const users = getAllUsers();
  return users.guards || [];
};

// Add admin user
export const addAdminUser = (username, password, firstName, lastName, contactNumber) => {
  const users = getAllUsers();
  
  // Check if username already exists
  if (users.admins.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Admin username already exists');
  }
  
  const newUser = {
    id: `admin_${Date.now()}`,
    username: username.toLowerCase(),
    firstName: firstName,
    lastName: lastName,
    password: password,
    contactNumber: contactNumber,
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  
  users.admins.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return newUser;
};

// Add guard user
export const addGuardUser = (username, password, firstName, lastName, contactNumber) => {
  const users = getAllUsers();
  
  // Check if username already exists
  if (users.guards.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Guard username already exists');
  }
  
  const newUser = {
    id: `guard_${Date.now()}`,
    username: username.toLowerCase(),
    firstName: firstName,
    lastName: lastName,
    password: password,
    contactNumber: contactNumber,
    role: 'guard',
    createdAt: new Date().toISOString()
  };
  
  users.guards.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return newUser;
};

// Delete admin user
export const deleteAdminUser = (id) => {
  const users = getAllUsers();
  users.admins = users.admins.filter(u => u.id !== id);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Delete guard user
export const deleteGuardUser = (id) => {
  const users = getAllUsers();
  users.guards = users.guards.filter(u => u.id !== id);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Update admin user
export const updateAdminUser = (id, username, password, firstName, lastName, contactNumber) => {
  const users = getAllUsers();
  const userIndex = users.admins.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  users.admins[userIndex] = {
    ...users.admins[userIndex],
    username: username.toLowerCase(),
    password: password,
    firstName: firstName,
    lastName: lastName,
    contactNumber: contactNumber
  };
  
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return users.admins[userIndex];
};

// Update guard user
export const updateGuardUser = (id, username, password, firstName, lastName, contactNumber) => {
  const users = getAllUsers();
  const userIndex = users.guards.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  users.guards[userIndex] = {
    ...users.guards[userIndex],
    username: username.toLowerCase(),
    password: password,
    firstName: firstName,
    lastName: lastName,
    contactNumber: contactNumber
  };
  
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return users.guards[userIndex];
};

// Validate user credentials - used for login
export const validateUserCredentials = (username, password, role) => {
  const users = getAllUsers();
  const userList = role === 'admin' ? users.admins : users.guards;
  
  const user = userList.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    return { valid: false, user: null };
  }
  
  if (user.password !== password) {
    return { valid: false, user: null };
  }
  
  return { valid: true, user: { username: user.username, role: user.role } };
};

// Reset to default users
export const resetToDefaultUsers = () => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
};
