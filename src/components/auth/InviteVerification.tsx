import React, { useState, useEffect } from 'react';
import useAuth from "../../context/useAuthContext";
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Building, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

interface InviteVerificationProps {
  token: string;
  onVerified: (inviteData: any) => void;
  onBack: () => void;
}

export const InviteVerification: React.FC<InviteVerificationProps> = ({
  token,
  onVerified,
  onBack
}) => {
  const { verifyInviteToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const data = await verifyInviteToken(token);
        setInviteData(data);
      } catch (err: any) {
        setError(err.message || 'Invalid or expired invitation');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, verifyInviteToken]);

  const handleContinue = () => {
    if (inviteData) {
      onVerified(inviteData);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-12">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Verifying invitation...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={onBack} variant="outline">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!inviteData) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation Not Found</h2>
          <p className="text-gray-600 mb-6">This invitation link is not valid or has expired.</p>
          <Button onClick={onBack} variant="outline">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isExpired = new Date(inviteData.expiresAt) < new Date();

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
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Invitation Details</span>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Organization:</strong> {inviteData.orgName}</p>
              <p><strong>Invited by:</strong> {inviteData.inviterName}</p>
              <p><strong>Role:</strong> {inviteData.role}</p>
              <p><strong>Email:</strong> {inviteData.email}</p>
            </div>
          </div>

          {isExpired ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Invitation Expired</span>
              </div>
              <p className="text-sm text-red-800">
                This invitation expired on {new Date(inviteData.expiresAt).toLocaleDateString()}.
                Please contact {inviteData.inviterName} for a new invitation.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Valid Invitation</span>
              </div>
              <p className="text-sm text-green-800">
                This invitation expires on {new Date(inviteData.expiresAt).toLocaleDateString()}.
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={isExpired}
              className="flex-1"
            >
              Continue to Signup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};