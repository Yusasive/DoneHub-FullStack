import React, { useEffect, useState } from "react";
import API from "../../../api";
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

interface Log {
  _id: string;
  action: string;
  user_id: {
    name: string;
    email: string;
  };
  org_id?: {
    name: string;
  };
  details: string;
  createdAt: string;
}

export const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await API.get("/admin/audit-logs", {
        params: { page, limit: 20 },
      });
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to fetch activity logs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchLogs(newPage);
    }
  };

  const formatLogDetails = (log: Log) => {
    const { details, action } = log;

    if (typeof details === "string") {
      return details;
    }

    if (details && typeof details === "object") {
      const detailsObj = details as any;
      switch (action) {
        case "user_login":
          return "User logged in successfully.";
        case "user_updated":
          if (detailsObj.body) {
            const fields = Object.keys(detailsObj.body).join(", ");
            return `Updated profile fields: ${fields}.`;
          }
          return "User profile updated.";
        case "org_created":
          return `Organization "${detailsObj.body?.name}" created.`;
        default:
          return `Action: ${action}`;
      }
    }
    return "No details available.";
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">System Activity Log</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
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
                    <TableHead>Action</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <div>{log.user_id?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.user_id?.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{log.action}</Badge>
                      </TableCell>
                      <TableCell>{log.org_id?.name || "N/A"}</TableCell>
                      <TableCell>{formatLogDetails(log)}</TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current <= 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current >= pagination.pages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
