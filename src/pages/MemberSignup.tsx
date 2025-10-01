import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { completeMemberSignup, verifyInviteToken } from '../utils/mockApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

export const MemberSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState<{ invite: any; organization: any } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setErrors({ invite: 'Invalid or missing invite token' });
      return;
    }

    const verifyInvite = async () => {
      try {
        const result = await verifyInviteToken(token);
        setInviteData(result);
      } catch (error: any) {
        setErrors({ invite: error.message || 'Error verifying invite' });
      }
    };

    verifyInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (!inviteData) {
        throw new Error('Invite not loaded');
      }

      await completeMemberSignup({
        token: inviteData.invite.token,
        name: formData.name,
        password: formData.password,
      });

      await signIn(inviteData.invite.email, formData.password);

      navigate('/dashboard');
    } catch (error: any) {
      setErrors({ submit: error.message || 'An error occurred during signup' });
    } finally {
      setLoading(false);
    }
  };

  if (errors.invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite</h2>
          <p className="text-gray-600 mb-6">{errors.invite}</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Verifying invite...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Join {inviteData.organization?.name}</h2>
          <p className="mt-2 text-sm text-gray-600">
            You've been invited to join as a member
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={inviteData.invite.email}
              disabled
              className="bg-gray-50"
            />
            <Input
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
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
            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
            />
            {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
