// Script to create test users for the role-based login system
// Run this script to create initial admin, customer, and employee accounts

const testUsers = [
  {
    email: 'admin@aurexissolution.com',
    role: 'admin',
    uniqueId: 'ADMIN001',
    defaultPassword: 'Aurexis3129',
    commissionRate: 0,
    isActive: true,
    hasChangedPassword: false
  },
  {
    email: 'customer1@example.com',
    role: 'customer',
    uniqueId: 'CUST001',
    defaultPassword: 'CustomerPass123',
    commissionRate: 0,
    isActive: true,
    hasChangedPassword: false
  },
  {
    email: 'employee1@example.com',
    role: 'employee',
    uniqueId: 'EMP001',
    defaultPassword: 'EmployeePass123',
    commissionRate: 15, // 15% commission
    totalEarned: 0,
    totalPaid: 0,
    pendingAmount: 0,
    isActive: true,
    hasChangedPassword: false
  }
];

console.log('Test Users Created:');
console.log('==================');
console.log('');

testUsers.forEach(user => {
  console.log(`${user.role.toUpperCase()} ACCOUNT:`);
  console.log(`Email: ${user.email}`);
  console.log(`Unique ID: ${user.uniqueId}`);
  console.log(`Password: ${user.defaultPassword}`);
  console.log(`Role: ${user.role}`);
  if (user.commissionRate > 0) {
    console.log(`Commission Rate: ${user.commissionRate}%`);
  }
  console.log('---');
});

console.log('');
console.log('LOGIN INSTRUCTIONS:');
console.log('==================');
console.log('1. Go to the login page');
console.log('2. Select your role (Admin/Customer/Employee)');
console.log('3. Enter credentials:');
console.log('   - ADMIN: Use Email Address');
console.log('   - CUSTOMER/EMPLOYEE: Use Unique ID');
console.log('4. Enter the Password');
console.log('5. Click Login');
console.log('');
console.log('NOTE: Customers will be required to change their password on first login.');
console.log('Employees and Admins cannot change their passwords.');
