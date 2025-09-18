import React, { useState } from "react";
import useAuth from "../../context/useAuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onBack: () => void;
}

const ForgotPasswordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError("Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reset Your Password">
      <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
        {success ? (
          <div className="text-center p-4 bg-green-50 text-green-800 rounded-lg">
            <p>Password reset instructions have been sent to your email.</p>
          </div>
        ) : (
          <>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail />}
              required
              disabled={loading}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Send Instructions
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export const LoginForm: React.FC<LoginFormProps> = ({ onBack }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
          </div>
          <CardDescription>Sign in to your DoneHub account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              icon={<Mail />}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={<Lock />}
              required
            />
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div className="text-right">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForgotPassword(true)}
                className="px-0 h-auto py-1"
              >
                Forgot your password?
              </Button>
            </div>
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};
