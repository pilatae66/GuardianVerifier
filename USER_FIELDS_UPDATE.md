# User Registration Fields Update

## Summary
Added first name, last name, and contact number fields to both admin and guard user registrations.

## Changes Made

### 1. User Service (`src/services/userService.js`)
- **Default Users Updated**: Demo users now include:
  - Admin: `admin` / `demo123` with first name "Admin", last name "User", contact "1234567890"
  - Guard: `guard` / `demo123` with first name "Guard", last name "User", contact "0987654321"

- **Function Signatures Updated**:
  - `addAdminUser(username, password, firstName, lastName, contactNumber)`
  - `addGuardUser(username, password, firstName, lastName, contactNumber)`
  - `updateAdminUser(id, username, password, firstName, lastName, contactNumber)`
  - `updateGuardUser(id, username, password, firstName, lastName, contactNumber)`

- **User Object Structure**:
  ```javascript
  {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    password: string,
    contactNumber: string,
    role: 'admin' | 'guard',
    createdAt: ISO string
  }
  ```

### 2. Admin User Management (`src/pages/AdminUserManagement.js`)
- **New State Variables**:
  - `newFirstName`, `newLastName`, `newContactNumber`
  - `editFirstName`, `editLastName`, `editContactNumber`

- **Form Fields Added**:
  - First Name input field (required)
  - Last Name input field (required)
  - Contact Number input field (required)
  - Username and Password fields (existing)

- **Display Updates**:
  - User lists now show: `{firstName} {lastName}` instead of just username
  - Added contact number display with phone emoji: `📞 {contactNumber}`

- **Edit Form**:
  - All five fields (firstName, lastName, contactNumber, username, password) included
  - All fields are validated as required

- **Info Box Updated**:
  - Updated to mention all fields are required

### 3. Guard User Management (`src/pages/GuardUserManagement.js`)
- Same updates as AdminUserManagement but for guard users
- User display shows: `👥 {firstName} {lastName}` with contact number

### 4. User Management Styling (`src/pages/UserManagement.css`)
- **New CSS Class**: `.user-contact`
  - Font size: 14px
  - Color: #555 (dark gray)
  - Margin top: 8px
  - Font weight: 500 (medium)
  - Displays on its own line

## Validation Rules
All management pages validate:
- ✓ First name is required
- ✓ Last name is required
- ✓ Contact number is required
- ✓ Username is required and must be unique
- ✓ Password is required (minimum 6 characters)

## Storage
All user data including the new fields is persisted in localStorage under the `system_users` key in JSON format.

## Login
Login functionality remains unchanged:
- Users still authenticate with username and password
- The new fields (firstName, lastName, contactNumber) are not used for login authentication
- Users are still validated using the `validateUserCredentials()` function with username, password, and role

## Example Usage
```javascript
// Adding a new admin user
addAdminUser('john_admin', 'password123', 'John', 'Smith', '555-1234');

// Adding a new guard user
addGuardUser('jane_guard', 'password456', 'Jane', 'Doe', '555-5678');
```
