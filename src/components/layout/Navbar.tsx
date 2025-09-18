import React from 'react';
import useAuth from "../../context/useAuthContext";
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { NotificationCenter } from '../features/NotificationCenter';
import { Building, LogOut, Settings, User, UserCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [profileData, setProfileData] = React.useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (user) {
      setProfileData({ name: user.name, email: user.email });
    }
  }, [user]);

  if (!user) return null;

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'system_admin':
        return 'System Admin';
      case 'org_admin':
        return 'Organization Admin';
      case 'member':
        return 'Member';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'system_admin':
        return <Settings className="h-5 w-5" />;
      case 'org_admin':
        return <Building className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await updateProfile(profileData);
      setShowProfileModal(false);
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters long' });
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DoneHub</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationCenter />
            
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              {getRoleIcon(user.role)}
              <span className="text-sm font-medium text-gray-700">
                {getRoleDisplay(user.role)}
              </span>
            </div>
            
            <div className="relative group">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100"
              >
                <UserCircle className="h-4 w-4" />
              {user.name}
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      </nav>

      {/* Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Update Profile"
        size="md"
      >
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <Input
            label="Full Name"
            value={profileData.name}
            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
            required
          />

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProfileModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update Profile
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            required
          />

          <Input
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            error={errors.newPassword}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
            required
          />

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Change Password
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};