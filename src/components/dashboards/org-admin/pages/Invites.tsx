import { Card, CardContent, CardHeader } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { useEffect, useState } from "react";
import useAuth from "../../../../context/useAuthContext";
import { Invite } from "../../../../types";
import { Check, Clock, Copy, Mail, X } from "lucide-react";
import { InviteModal } from "../../../features/InviteModal";

export const OrgInvites = () => {
  const { getInvitations, sendInvitations, revokeInvitation } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState("");

  const load = async () => {
    const res = await getInvitations();
    setInvites(res || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSendInvites = async (
    emails: string[],
    personalMessage?: string
  ) => {
    if (!emails.length) return;
    await sendInvitations(emails, "member", personalMessage);
    await load();
  };

  const handleRevokeInvite = async (inviteId: string) => {
    await revokeInvitation(inviteId);
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(token);
    setTimeout(() => setCopied(""), 2000);
  };

  const pendingInvites = invites.filter((i) => i.status === "pending");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invites</h1>
        <p className="text-gray-600">Send and manage invitations</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Invite Team Members
            </h2>
            <Button onClick={() => setShowInviteModal(true)}>
              Send Invites
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pending Invitations
            </h3>
            {pendingInvites.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-4">No pending invitations</p>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  variant="outline"
                >
                  Send First Invitation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {invite.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          Expires in{" "}
                          {Math.ceil(
                            (new Date(invite.expires_at).getTime() -
                              Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invite.token && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invite.token!)}
                        >
                          {copied === invite.token ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSendInvite={handleSendInvites}
      />
    </div>
  );
};
