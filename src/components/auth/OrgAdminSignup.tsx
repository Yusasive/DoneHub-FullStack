import React, { useState } from "react";
import useAuth from "../../context/useAuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { ArrowLeft, User, Mail, Building, Clock } from "lucide-react";

interface OrgAdminSignupProps {
  onBack: () => void;
}

export const OrgAdminSignup: React.FC<OrgAdminSignupProps> = ({ onBack }) => {
  const { signupOrgAdmin } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orgName: "",
    orgDescription: "",
    industry: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("=== FRONTEND FORM SUBMISSION ===");
    console.log("Form data being submitted:", formData);
    console.log("orgDescription specifically:", formData.orgDescription);
    console.log("orgDescription length:", formData.orgDescription.length);

    try {
      await signupOrgAdmin(formData);
      setSubmitted(true);
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Request Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your organization admin request has been submitted for approval.
              You'll receive an email notification once it's reviewed.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong>
                <br />
                • System Admin will review your request
                <br />
                • You'll receive an email with the decision
                <br />• If approved, you can set up your organization
              </p>
            </div>
            <Button onClick={onBack} variant="outline">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isStep1Valid = formData.name && formData.email;
  const isStep2Valid = formData.orgName && formData.industry;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={step === 1 ? onBack : handleBack}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Organization Admin
              </h2>
              <p className="text-sm text-gray-600">Step {step} of 3</p>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i <= step ? "bg-blue-600" : "bg-gray-200"
                } transition-colors duration-300`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h3>

                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  icon={<User />}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  icon={<Mail />}
                  required
                />

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className="w-full"
                  size="lg"
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Organization Details
                </h3>

                <Input
                  label="Organization Name"
                  value={formData.orgName}
                  onChange={(e) => handleInputChange("orgName", e.target.value)}
                  placeholder="Enter organization name"
                  icon={<Building />}
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) =>
                      handleInputChange("industry", e.target.value)
                    }
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
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

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep2Valid}
                  className="w-full"
                  size="lg"
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Details
                </h3>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Organization Description (Optional)
                  </label>
                  <textarea
                    value={formData.orgDescription}
                    onChange={(e) =>
                      handleInputChange("orgDescription", e.target.value)
                    }
                    placeholder="Brief description of your organization..."
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={4}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Approval Required
                      </p>
                      <p className="text-sm text-yellow-700">
                        Your request will be reviewed by our system
                        administrator. You'll receive an email notification with
                        the decision.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  Submit Request
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
