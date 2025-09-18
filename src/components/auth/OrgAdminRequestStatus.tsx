import React from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Clock, Info, XCircle, ArrowLeft } from "lucide-react";

interface OrgAdminRequestStatusProps {
  status: "pending" | "needs_info" | "rejected";
  onBackToHome?: () => void;
}

export const OrgAdminRequestStatus: React.FC<OrgAdminRequestStatusProps> = ({
  status,
  onBackToHome,
}) => {
  const renderIcon = () => {
    switch (status) {
      case "pending":
        return (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        );
      case "needs_info":
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="h-8 w-8 text-blue-600" />
          </div>
        );
      case "rejected":
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="text-center">
          {renderIcon()}
          <h2 className="text-2xl font-bold text-gray-900">
            Organization Admin Request
          </h2>
        </div>
      </CardHeader>
      <CardContent>
        {status === "pending" && (
          <div className="space-y-4 text-center">
            <p className="text-gray-700">
              Your request is currently <strong>pending review</strong> by a
              system admin.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <p className="text-sm text-yellow-800">
                You will receive an email once a decision is made. This usually
                takes up to 1-2 business days.
              </p>
            </div>
          </div>
        )}

        {status === "needs_info" && (
          <div className="space-y-4 text-center">
            <p className="text-gray-700">
              Your request is on hold.{" "}
              <strong>More information is required</strong> to continue the
              review.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-800">
                Check your email for the details requested by our system admin.
                Once provided, your request will resume review.
              </p>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="space-y-4 text-center">
            <p className="text-gray-700">
              Unfortunately, your request has been <strong>rejected</strong>.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <p className="text-sm text-red-800">
                If you believe this was a mistake or need further assistance,
                please reply to the email you received or contact support.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={
              onBackToHome || (() => window.history.pushState({}, "", "/"))
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
