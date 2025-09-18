import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import useAuth from "../../../../context/useAuthContext";
import { Building, Settings as SettingsIcon, Save } from 'lucide-react';

export const OrgSettings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orgSettings, setOrgSettings] = useState({
    name: '',
    description: '',
    industry: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#6366F1',
    allowSelfRegistration: false,
    requireEmailVerification: true,
    inviteExpiration: 7
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  const handleOrgSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement organization settings update API
      console.log('Updating org settings:', orgSettings);
      // await updateOrgSettings(orgSettings);
    } catch (error) {
      console.error('Failed to update organization settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await updateProfile(profileData);
    } catch (error: any) {
      setErrors({ profile: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters long' });
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setErrors({ password: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Organization preferences and configuration
        </p>
      </div>

      <div className="space-y-8">
        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Organization Settings</h2>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOrgSettingsSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Organization Name"
                  value={orgSettings.name}
                  onChange={(e) => setOrgSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter organization name"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={orgSettings.industry}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, industry: e.target.value }))}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={orgSettings.description}
                  onChange={(e) => setOrgSettings(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  rows={3}
                  placeholder="Brief description of your organization"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Primary Color"
                  type="color"
                  value={orgSettings.primaryColor}
                  onChange={(e) => setOrgSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                />

                <Input
                  label="Secondary Color"
                  type="color"
                  value={orgSettings.secondaryColor}
                  onChange={(e) => setOrgSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Invitation Settings</h3>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allowSelfRegistration"
                    checked={orgSettings.allowSelfRegistration}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, allowSelfRegistration: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="allowSelfRegistration" className="text-sm text-gray-700">
                    Allow self-registration for members
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="requireEmailVerification"
                    checked={orgSettings.requireEmailVerification}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, requireEmailVerification: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="requireEmailVerification" className="text-sm text-gray-700">
                    Require email verification for new members
                  </label>
                </div>

                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Expiration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={orgSettings.inviteExpiration}
                    onChange={(e) => setOrgSettings(prev => ({ ...prev, inviteExpiration: parseInt(e.target.value) }))}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" loading={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Organization Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
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

              {errors.profile && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.profile}</p>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" loading={loading}>
                  Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
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
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />

              {errors.password && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{errors.password}</p>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" loading={loading}>
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};