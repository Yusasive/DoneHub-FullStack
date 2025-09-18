import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DemoCredentials = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">Demo Credentials</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>
            You can use the following credentials to explore the application:
          </p>
          <div className="p-4 bg-blue-50 rounded-lg text-blue-800">
            <p>
              <strong>System Admin:</strong>
            </p>
            <p>
              Email: <code>admin@system.com</code>
            </p>
            <p>
              Password: <code>password123</code>
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-green-800">
            <p>
              <strong>Organization Admin:</strong>
            </p>
            <p>
              Email: <code>orgadmin@company.com</code>
            </p>
            <p>
              Password: <code>password123</code>
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800">
            <p>
              <strong>Member:</strong>
            </p>
            <p>
              Email: <code>member@company.com</code>
            </p>
            <p>
              Password: <code>password123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
