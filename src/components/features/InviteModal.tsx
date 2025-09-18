import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Mail, X, Plus } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvite: (emails: string[], personalMessage?: string) => Promise<any>;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  onSendInvite,
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addEmail = () => {
    if (!currentEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (emails.includes(currentEmail)) {
      setError("Email already added");
      return;
    }

    setEmails((prev) => [...prev, currentEmail]);
    setCurrentEmail("");
    setError("");
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails((prev) => prev.filter((email) => email !== emailToRemove));
  };

  const handleSendInvites = async () => {
    if (emails.length === 0) return;

    setLoading(true);
    try {
      await onSendInvite(emails, personalMessage);
      setEmails([]);
      setCurrentEmail("");
      setPersonalMessage("");
      onClose();
    } catch (err) {
      setError("Failed to send invites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Members"
      size="lg"
    >
      <div className="space-y-6">
        <div>
          <p className="text-gray-600 mb-4">
            Send invitations to new team members. They'll receive an email with
            a secure link to join your organization.
          </p>

          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter email address"
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                icon={<Mail />}
                error={error}
              />
            </div>
            <Button
              onClick={addEmail}
              disabled={!currentEmail}
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {emails.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Email Invitations ({emails.length})
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {emails.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900">{email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmail(email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Message (Optional)
          </label>
          <textarea
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Add a personal message to your invitation..."
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvites}
            loading={loading}
            disabled={emails.length === 0}
          >
            Send {emails.length} Invitation{emails.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
