import React, { useEffect, useState } from "react";
import API from "../../../api";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Input } from "../../ui/Input";
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

interface Organization {
  _id: string;
  name: string;
  industry: string;
  status: "active" | "pending" | "suspended" | "rejected";
  createdAt: string;
  created_by: {
    name: string;
  };
}

export const OrgManagement: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [search, setSearch] = useState("");

  const fetchOrganizations = async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const response = await API.get("/admin/organizations", {
        params: { page, limit: 10, search: searchTerm },
      });
      setOrganizations(response.data.organizations);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to fetch organizations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations(1, search);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchOrganizations(newPage, search);
    }
  };

  const getStatusBadge = (status: Organization["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "suspended":
        return <Badge variant="danger">Suspended</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Organization Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow key={org._id}>
                      <TableCell>{org.name}</TableCell>
                      <TableCell>{org.industry}</TableCell>
                      <TableCell>{org.created_by?.name || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(org.status)}</TableCell>
                      <TableCell>
                        {new Date(org.createdAt).toLocaleDateString()}
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
