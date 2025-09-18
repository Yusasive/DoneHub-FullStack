import React, { useState, useEffect } from "react";
import API from "../../../api";
import { useToast } from "../../../hooks/useToast";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/Table";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";

interface Request {
  _id: string;
  name: string;
  email: string;
  org_id: {
    name: string;
    description: string;
    industry: string;
  };
  createdAt: string;
}

export const ApprovalRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [modalAction, setModalAction] = useState<
    "approve" | "reject" | "info" | null
  >(null);
  const [actionReason, setActionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      const response = await API.get("/admin/requests", {
        params: { page, limit: 10, status: "pending" },
      });
      setRequests(response.data.requests);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to fetch approval requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, []);

  // Removed unused handlePageChange function

  const openModal = (
    request: Request,
    action: "approve" | "reject" | "info"
  ) => {
    setSelectedRequest(request);
    setModalAction(action);
    setActionReason("");
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setModalAction(null);
  };

  const handleActionSubmit = async () => {
    if (!selectedRequest || !modalAction) return;

    setIsSubmitting(true);
    try {
      let endpoint = "";
      let payload: any = {};

      if (modalAction === "approve") {
        endpoint = `/admin/approve/${selectedRequest._id}`;
        payload = { welcomeMessage: actionReason || "Welcome aboard!" };
      } else if (modalAction === "reject") {
        endpoint = `/admin/reject/${selectedRequest._id}`;
        payload = { reason: actionReason };
      } else if (modalAction === "info") {
        endpoint = `/admin/request-info/${selectedRequest._id}`;
        payload = { questions: actionReason };
      }

      await API.post(endpoint, payload);
      toast.success(`Request successfully ${modalAction}ed.`);
      fetchRequests(pagination.current);
      closeModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModalContent = () => {
    if (!modalAction || !selectedRequest) return null;

    const titles = {
      approve: "Approve Request",
      reject: "Reject Request",
      info: "Request More Information",
    };

    const labels = {
      approve: "Optional: Welcome Message",
      reject: "Reason for Rejection",
      info: "Questions for the User",
    };

    return (
      <div>
        <h3 className="text-lg font-bold mb-4">{titles[modalAction]}</h3>
        <p className="mb-2">
          <strong>User:</strong> {selectedRequest.name}
        </p>
        <p className="mb-4">
          <strong>Organization:</strong> {selectedRequest.org_id.name}
        </p>
        <Input
          label={labels[modalAction]}
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
          placeholder={
            modalAction === "reject"
              ? "Provide a clear reason..."
              : "Enter text..."
          }
          textarea={true}
        />
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={handleActionSubmit}
            disabled={
              isSubmitting || (modalAction !== "approve" && !actionReason)
            }
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : "Submit"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Approval Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Organization Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell>
                        <div>{req.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {req.email}
                        </div>
                      </TableCell>
                      <TableCell>{req.org_id.name}</TableCell>
                      <TableCell>
                        <Badge>{req.org_id.industry}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => openModal(req, "approve")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => openModal(req, "reject")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal(req, "info")}
                        >
                          Info
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination controls can be added here if needed */}
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={!!modalAction}
        onClose={closeModal}
        title={
          modalAction === "approve"
            ? "Approve Request"
            : modalAction === "reject"
            ? "Reject Request"
            : modalAction === "info"
            ? "Request More Information"
            : ""
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};
