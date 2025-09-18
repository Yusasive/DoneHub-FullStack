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

interface User {
  _id: string;
  name: string;
  email: string;
  role: "system_admin" | "org_admin" | "member";
  status: "active" | "pending" | "suspended" | "rejected";
  createdAt: string;
  org_id?: {
    name: string;
  };
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [search, setSearch] = useState("");

  const fetchUsers = async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const response = await API.get("/admin/users", {
        params: { page, limit: 10, search: searchTerm },
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchUsers(newPage, search);
    }
  };

  const getStatusBadge = (status: User["status"]) => {
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
      <h1 className="text-3xl font-bold">User Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Search by name or email..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="info">
                          {user.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.org_id?.name || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
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
