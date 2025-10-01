import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Invite } from '../types';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export const OrgAdminDashboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (user?.org_id) {
      loadMembers();
      loadInvites();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('org_id', user?.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('org_id', user?.org_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);

    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from('invites').insert({
        org_id: user?.org_id,
        email: inviteEmail,
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      });

      if (error) throw error;

      const link = `${window.location.origin}/signup/member?token=${token}`;
      setInviteLink(link);
      setInviteEmail('');
      await loadInvites();
    } catch (error: any) {
      console.error('Error sending invite:', error);
      alert(error.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
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
          <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your team members and invitations</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
              <span className="text-sm text-gray-500">{members.length} members</span>
            </div>

            <div className="space-y-3">
              {members.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No members yet</p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <StatusBadge status={member.status as any} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              onClick={() => setShowInviteModal(true)}
              className="w-full mt-4"
            >
              Invite New Member
            </Button>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Pending Invites</h2>
              <span className="text-sm text-gray-500">
                {invites.filter((i) => i.status === 'pending').length} pending
              </span>
            </div>

            <div className="space-y-3">
              {invites.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No invites sent</p>
              ) : (
                invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{invite.email}</p>
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={invite.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Team Member</h3>

            {inviteLink ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Share this link with your team member:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg break-all text-sm">
                  {inviteLink}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={copyInviteLink} className="flex-1">
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => {
                      setInviteLink('');
                      setShowInviteModal(false);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                />
                <div className="flex space-x-2">
                  <Button type="submit" disabled={inviteLoading} className="flex-1">
                    {inviteLoading ? 'Generating...' : 'Generate Invite Link'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
