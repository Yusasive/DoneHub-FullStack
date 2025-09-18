import React, { useState } from "react";
import useAuth from "../../context/useAuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { User, Mail, Lock, Building} from "lucide-react";

interface MemberSignupProps {
  token: string;
  inviteData?: any;
  onBack: () => void;
}

export const MemberSignup: React.FC<MemberSignupProps> = ({
  token,
  inviteData,
  onBack,
}) => {
  const { signupMember } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: inviteData?.email || "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (inviteData?.email && formData.email !== inviteData.email) {
      newErrors.email = "Email must match the invitation";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await signupMember(token, formData);
    } catch (error) {
      setErrors({ general: "Signup failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (!inviteData) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Invalid invitation data</p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">You're Invited!</h2>
          <p className="text-gray-600 mt-2">
            Join <strong>{inviteData.orgName}</strong>
          </p>
          <div className="bg-blue-50 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-800">
              Invited by <strong>{inviteData.inviterName}</strong>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter your full name"
            icon={<User />}
            error={errors.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter your email"
            disabled={!!inviteData?.email}
            icon={<Mail />}
            error={errors.email}
            required
          />

          {inviteData?.email && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This invitation is specifically for{" "}
                {inviteData.email}
              </p>
            </div>
          )}

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Create a password"
            icon={<Lock />}
            error={errors.password}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            placeholder="Confirm your password"
            icon={<Lock />}
            error={errors.confirmPassword}
            required
          />

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Join Organization
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onBack}>
            Back to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
