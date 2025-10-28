// components/dashboard/Settings.tsx
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Settings, User, Mail, Shield, Save, Edit } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    role: user?.role || 'user'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Simulate API call - in a real app, this would update the user profile in Firebase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveMessage('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error updating profile. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.email?.split('@')[0] || '',
      email: user?.email || '',
      role: user?.role || 'user'
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
          <p className="text-text-secondary">Manage your account and preferences</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center"
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
              >
                <Save size={16} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success/Error Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.includes('successfully') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-surface p-6 rounded-lg border border-neutral">
        <div className="flex items-center mb-6">
          <User size={24} className="text-primary mr-3" />
          <h3 className="text-xl font-semibold text-text-primary">Profile Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-text-primary py-2">{profileData.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Email Address
            </label>
            <div className="flex items-center">
              <Mail size={16} className="text-text-secondary mr-2" />
              <p className="text-text-primary py-2">{profileData.email}</p>
            </div>
            <p className="text-xs text-text-secondary mt-1">Email cannot be changed</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Account Type
            </label>
            <div className="flex items-center">
              <Shield size={16} className="text-text-secondary mr-2" />
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                profileData.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {profileData.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Account Status
            </label>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-surface p-6 rounded-lg border border-neutral">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Account Actions</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-background rounded-lg">
            <div>
              <h4 className="font-medium text-text-primary">Change Password</h4>
              <p className="text-sm text-text-secondary">Update your account password</p>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Change
            </button>
          </div>

          <div className="flex justify-between items-center p-4 bg-background rounded-lg">
            <div>
              <h4 className="font-medium text-text-primary">Download Data</h4>
              <p className="text-sm text-text-secondary">Export your account data</p>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Download
            </button>
          </div>

          <div className="flex justify-between items-center p-4 bg-background rounded-lg">
            <div>
              <h4 className="font-medium text-text-primary">Delete Account</h4>
              <p className="text-sm text-text-secondary">Permanently delete your account</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="bg-surface p-6 rounded-lg border border-neutral">
        <h3 className="text-xl font-semibold text-text-primary mb-4">Need Help?</h3>
        <p className="text-text-secondary mb-4">
          If you need assistance with your account or have any questions, please contact our support team.
        </p>
        <div className="flex gap-2">
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Contact Support
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            View FAQ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;