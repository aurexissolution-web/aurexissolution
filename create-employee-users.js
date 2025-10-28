// Script to create employee users for testing
// This shows the data structure for employee users

const employeeUsers = [
  {
    email: 'employee1@aurexissolution.com',
    role: 'employee',
    uniqueId: 'EMP001',
    defaultPassword: 'EmployeePass123',
    commissionRate: 15,
    totalEarned: 0,
    totalPaid: 0,
    pendingAmount: 0,
    hasChangedPassword: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    email: 'employee2@aurexissolution.com',
    role: 'employee',
    uniqueId: 'EMP002',
    defaultPassword: 'EmployeePass123',
    commissionRate: 12,
    totalEarned: 0,
    totalPaid: 0,
    pendingAmount: 0,
    hasChangedPassword: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    email: 'employee3@aurexissolution.com',
    role: 'employee',
    uniqueId: 'EMP003',
    defaultPassword: 'EmployeePass123',
    commissionRate: 18,
    totalEarned: 0,
    totalPaid: 0,
    pendingAmount: 0,
    hasChangedPassword: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'admin'
  }
];

console.log('EMPLOYEE USERS TO CREATE:');
console.log('========================');
console.log('');

employeeUsers.forEach((user, index) => {
  console.log(`EMPLOYEE ${index + 1}:`);
  console.log(`Email: ${user.email}`);
  console.log(`Unique ID: ${user.uniqueId}`);
  console.log(`Password: ${user.defaultPassword}`);
  console.log(`Role: ${user.role}`);
  console.log(`Commission Rate: ${user.commissionRate}%`);
  console.log('---');
});

console.log('');
console.log('HOW TO CREATE THESE USERS:');
console.log('==========================');
console.log('1. Go to your admin dashboard');
console.log('2. Navigate to "User Management" tab');
console.log('3. Click "Add User" button');
console.log('4. For each employee:');
console.log('   - Enter the email address');
console.log('   - Select "employee" role');
console.log('   - Set commission rate (optional)');
console.log('   - Click "Save"');
console.log('');
console.log('ALTERNATIVE: Manual Firebase Creation');
console.log('=====================================');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/aurexissolutionwebsite/firestore/data');
console.log('2. Navigate to Firestore Database');
console.log('3. Go to "users" collection');
console.log('4. Add new documents with the data above');
console.log('');
console.log('TESTING EMPLOYEE MONITORING:');
console.log('============================');
console.log('1. After creating employees, go to "Employee Monitoring" tab');
console.log('2. You should now see the employee users');
console.log('3. Employees can clock in/out from their dashboard');
console.log('4. Their time tracking will appear in real-time');
