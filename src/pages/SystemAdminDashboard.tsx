import { useState, useEffect } from 'react';
import { approveOrgAdminRequest, listOrgAdminRequests, rejectOrgAdminRequest } from '../utils/mockApi';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { OrgAdminRequest } from '../types';

export const SystemAdminDashboard = () => {
  const [requests, setRequests] = useState<OrgAdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<OrgAdminRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await listOrgAdminRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: OrgAdminRequest) => {
    setActionLoading(true);
    try {
      await approveOrgAdminRequest(request.id);
      setSelectedRequest(null);
      await loadRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (request: OrgAdminRequest) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await rejectOrgAdminRequest(request.id, rejectionReason);
      setSelectedRequest(null);
      setRejectionReason('');
      await loadRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert(error.message);
    } finally {
      setActionLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">System Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Review and manage organization admin requests</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Pending Requests</h2>
              <span className="text-sm text-gray-500">
                {requests.filter((r) => r.status === 'pending').length} pending
              </span>
            </div>

            <div className="space-y-4">
              {requests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No requests found</p>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{request.name}</h3>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{request.email}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Organization:</span> {request.org_name}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Role:</span> {request.role}
                          </p>
                          <p className="text-sm text-gray-500">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {request.rejected_reason && (
                          <p className="mt-2 text-sm text-red-600">
                            <span className="font-medium">Rejection reason:</span>{' '}
                            {request.rejected_reason}
                          </p>
                        )}
                      </div>
                      {request.status === 'pending' && (
                        <div className="ml-4 space-x-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            Review
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Review Request</h3>
            <div className="space-y-3 mb-6">
              <p>
                <span className="font-medium">Name:</span> {selectedRequest.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {selectedRequest.email}
              </p>
              <p>
                <span className="font-medium">Organization:</span> {selectedRequest.org_name}
              </p>
              <p>
                <span className="font-medium">Role:</span> {selectedRequest.role}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  placeholder="Provide a reason if rejecting..."
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleReject(selectedRequest)}
                  disabled={actionLoading}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                >
                  Reject
                </Button>
              </div>
              <Button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                variant="secondary"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
