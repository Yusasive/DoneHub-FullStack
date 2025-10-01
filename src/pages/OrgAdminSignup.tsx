import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrgAdminRequest } from '../utils/mockApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

export const OrgAdminSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    orgName: '',
    role: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.orgName.trim()) newErrors.orgName = 'Organization name is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      await createOrgAdminRequest({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        orgName: formData.orgName,
        role: formData.role,
      });

      navigate('/signup-success');
    } catch (error: any) {
      setErrors({ submit: error.message || 'An error occurred during signup' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign up as Organization Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your request will be reviewed by our team
          </p>
        </div>

        <Card>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className={`flex-1 h-1 rounded ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-1 rounded ml-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Personal Info</span>
              <span>Organization</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  required
                />
                <Button type="button" onClick={handleNext} className="w-full">
                  Next
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label="Organization Name"
                  type="text"
                  value={formData.orgName}
                  onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                  error={errors.orgName}
                  required
                />
                <Input
                  label="Your Role in Organization"
                  type="text"
                  placeholder="e.g., CEO, Manager, Team Lead"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  error={errors.role}
                  required
                />
                {errors.submit && (
                  <p className="text-sm text-red-500">{errors.submit}</p>
                )}
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Already have an account? Sign in
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
