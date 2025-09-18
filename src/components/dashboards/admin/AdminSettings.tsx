import React, { useState } from "react";
import useAuth from "../../../context/useAuthContext";
import { useToast } from "../../../hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { LoadingSpinner } from "../../ui/LoadingSpinner";

export const AdminSettings: React.FC = () => {
  const { user, updateUserProfile, changeUserPassword } = useAuth();
  const { toast } = useToast();

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsProfileSubmitting(true);
    try {
      await updateUserProfile({ name, email });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsPasswordSubmitting(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password.");
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin Settings</h1>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
            />
            <div className="pt-2">
              <Button type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a new password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
            <div className="pt-2">
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
