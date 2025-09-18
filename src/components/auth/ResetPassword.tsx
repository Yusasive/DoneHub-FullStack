import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../context/api";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Toast } from "../ui/Toast";

const ResetPassword: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      setSuccess("Password reset successful. You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
      ) {
        setError(
          (err as { response: { data: { message: string } } }).response.data
            .message || "Failed to reset password."
        );
      } else {
        setError("Failed to reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
        {error && (
          <Toast message={error} type="error" onClose={() => setError("")} />
        )}
        {success && (
          <Toast
            message={success}
            type="success"
            onClose={() => setSuccess("")}
          />
        )}
        <Input
          type="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} className="mt-4 w-full">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
