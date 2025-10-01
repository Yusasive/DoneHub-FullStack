import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Card } from '../components/Card';
import { Organization } from '../types';

export const MemberDashboard = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.org_id) {
      loadOrganization();
    }
  }, [user]);

  const loadOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user?.org_id)
        .maybeSingle();

      if (error) throw error;
      setOrganization(data);
    } catch (error) {
      console.error('Error loading organization:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            You're a member of {organization?.name}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Profile</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Name:</span>{' '}
                <span className="text-gray-600">{user?.name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Email:</span>{' '}
                <span className="text-gray-600">{user?.email}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Role:</span>{' '}
                <span className="text-gray-600 capitalize">{user?.role.replace('_', ' ')}</span>
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Organization</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Name:</span>{' '}
                <span className="text-gray-600">{organization?.name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Status:</span>{' '}
                <span className="text-gray-600 capitalize">{organization?.status}</span>
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                No tasks assigned yet
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
