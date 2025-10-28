import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, UserRole } from '../../types';
import { Plus, Edit, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';

const AdminUserManagement: React.FC = () => {
  const { users, createUser, updateUser, deleteUser } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedCredentials, setCopiedCredentials] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'customer' as UserRole,
    assignedProjects: [] as string[],
    newPassword: '',
    department: '',
    team: '',
    position: '',
    reportsTo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update existing user
      try {
        const updates: any = {
          email: formData.email,
          role: formData.role,
          assignedProjects: formData.assignedProjects,
          department: formData.department,
          team: formData.team,
          position: formData.position,
          reportsTo: formData.reportsTo
        };
        
        // Only update password if a new one is provided
        if (formData.newPassword && formData.newPassword.trim() !== '') {
          updates.password = formData.newPassword;
          updates.defaultPassword = formData.newPassword;
          updates.hasChangedPassword = false;
        }
        
        await handleEdit(editingUser.id, updates);
        resetForm();
        setShowModal(false);
        setEditingUser(null);
      } catch (error: any) {
        alert(`Error updating user: ${error.message || error}`);
      }
    } else {
      // Create new user
      const result = await createUser(formData);
      
      if (result.success) {
        resetForm();
        setShowModal(false);
      } else {
        alert(`Error: ${result.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      role: 'customer',
      assignedProjects: [],
      newPassword: '',
      department: '',
      team: '',
      position: '',
      reportsTo: ''
    });
  };

  const handleEdit = async (userId: string, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates);
    } catch (error) {
      alert(`Error updating user: ${error}`);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      alert(`Error deleting user: ${error}`);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const copyCredentials = (user: User) => {
    // For employees, copy email. For others, copy unique ID
    const isEmployeeRole = ['employee', 'finance_executive', 'marketing_head', 'manager', 'team_lead', 'normal_employee'].includes(user.role);
    const credential = isEmployeeRole ? user.email : user.uniqueId;
    const credentials = `${isEmployeeRole ? 'Email' : 'Unique ID'}: ${credential}\nPassword: ${user.defaultPassword}`;
    navigator.clipboard.writeText(credentials);
    setCopiedCredentials(user.uniqueId);
    setTimeout(() => setCopiedCredentials(null), 2000);
  };

  const openModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'hr':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'finance_executive':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'marketing_head':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'manager':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'team_lead':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'normal_employee':
      case 'employee':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'freelancer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'customer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      admin: 'Admin',
      hr: 'HR Manager',
      finance_executive: 'Finance Executive',
      marketing_head: 'Marketing Head',
      manager: 'Manager',
      team_lead: 'Team Lead',
      normal_employee: 'Normal Employee',
      freelancer: 'Freelancer',
      customer: 'Customer'
    };
    return roleNames[role] || role;
  };

  const isEmployeeRole = (role: UserRole) => {
    return ['finance_executive', 'marketing_head', 'manager', 'team_lead', 'normal_employee'].includes(role);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">User Management</h2>
        <button
          onClick={openModal}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-surface/50 backdrop-blur-lg border border-neutral rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Credentials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-background/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{user.email}</div>
                      <div className="text-sm text-text-secondary">ID: {user.uniqueId}</div>
                      {user.position && (
                        <div className="text-xs text-text-secondary">Position: {user.position}</div>
                      )}
                      <div className="text-xs text-text-secondary">
                        Created: {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                      {user.department && (
                        <div className="text-xs text-text-secondary">Dept: {user.department}</div>
                      )}
                      {user.team && (
                        <div className="text-xs text-text-secondary">Team: {user.team}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm">
                        <div className="text-text-primary font-mono text-xs">
                          {isEmployeeRole(user.role) ? user.email : user.uniqueId}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-text-secondary font-mono text-xs">
                            {showPasswords[user.id] ? user.defaultPassword : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-text-secondary hover:text-text-primary"
                          >
                            {showPasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => copyCredentials(user)}
                        className="text-text-secondary hover:text-text-primary"
                        title="Copy credentials"
                      >
                        {copiedCredentials === user.uniqueId ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.role === 'customer' && (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.hasChangedPassword ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.hasChangedPassword ? 'Password Changed' : 'Default Password'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            email: user.email,
                            role: user.role,
                            assignedProjects: user.assignedProjects || [],
                            newPassword: '',
                            department: user.department || '',
                            team: user.team || '',
                            position: user.position || '',
                            reportsTo: user.reportsTo || ''
                          });
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary/80"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.role !== 'admin' && user.role !== 'hr' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface/90 backdrop-blur-lg border border-neutral rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              {editingUser && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    ✏️ <strong>Editing:</strong> {editingUser.email} (ID: {editingUser.uniqueId})
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    You can modify all user details
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email Address
                  </label>
                  <input
                    id="user-email"
                    name="user-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={editingUser !== null}
                  />
                  {editingUser && (
                    <p className="text-xs text-text-secondary mt-1">
                      ⚠️ Email cannot be changed after creation
                    </p>
                  )}
                </div>
                
                {/* Role */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Role
                  </label>
                  <select
                    id="user-role"
                    name="user-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <optgroup label="External Roles">
                      <option value="customer">Customer</option>
                      <option value="freelancer">Freelancer</option>
                    </optgroup>
                    <optgroup label="Internal Employee Roles">
                      <option value="finance_executive">Finance Executive</option>
                      <option value="marketing_head">Marketing Head</option>
                      <option value="manager">Manager</option>
                      <option value="team_lead">Team Lead</option>
                      <option value="normal_employee">Normal Employee</option>
                    </optgroup>
                    <optgroup label="Administrative Roles">
                      <option value="hr">HR Manager</option>
                    </optgroup>
                  </select>
                  {isEmployeeRole(formData.role) && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      🎯 Employees login with their email address
                    </p>
                  )}
                  {!isEmployeeRole(formData.role) && formData.role !== 'admin' && formData.role !== 'hr' && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      🔑 {formData.role === 'customer' ? 'Customers' : 'Freelancers'} login with their unique ID
                    </p>
                  )}
                </div>

                {/* Department (for employees) */}
                {isEmployeeRole(formData.role) && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Department
                    </label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Engineering, Sales"
                    />
                  </div>
                )}

                {/* Team (for employees) */}
                {isEmployeeRole(formData.role) && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Team
                    </label>
                    <input
                      id="team"
                      name="team"
                      type="text"
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Frontend Team, Sales Team A"
                    />
                  </div>
                )}

                {/* Position (for employees) */}
                {isEmployeeRole(formData.role) && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Position
                    </label>
                    <input
                      id="position"
                      name="position"
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Senior Developer, Sales Manager"
                    />
                  </div>
                )}

                {/* Reports To (for employees) */}
                {isEmployeeRole(formData.role) && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Reports To (Email)
                    </label>
                    <input
                      id="reports-to"
                      name="reports-to"
                      type="email"
                      value={formData.reportsTo}
                      onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value })}
                      className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="manager@company.com"
                    />
                  </div>
                )}
                
                {/* New Password (for editing) */}
                {editingUser && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      New Password (Optional)
                    </label>
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-background/50 border border-neutral rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Leave blank to keep current password"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      💡 Enter a new password only if you want to change it
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
