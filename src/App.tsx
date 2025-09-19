import useAuth from "./context/useAuthContext";
import { useToast } from "./hooks/useToast";
import { Toast } from "./components/ui/Toast";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { Landing } from "./components/Landing";
import { LoginForm } from "./components/auth/LoginForm";
import { OrgAdminSignup } from "./components/auth/OrgAdminSignup";
import { MemberSignup } from "./components/auth/MemberSignup";
import ResetPassword from "./components/auth/ResetPassword";
import { InviteVerification } from "./components/auth/InviteVerification";
import { SystemAdminDashboard } from "./components/dashboards/SystemAdminDashboard";
import { OrgAdminDashboard } from "./components/dashboards/OrgAdminDashboard";
import { MemberDashboard } from "./components/dashboards/MemberDashboard";
import { Navbar } from "./components/layout/Navbar";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

function App() {
  const { user, loading } = useAuth();
  const { toasts, removeToast } = useToast();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const InviteWrapper = () => {
    const { token } = useParams();
    return (
      <InviteVerification
        token={token!}
        onVerified={(inviteData) =>
          navigate(`/signup/member/${token}`, { state: { inviteData } })
        }
        onBack={() => navigate("/")}
      />
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {user ? (
            <>
              {user.role === "system_admin" && (
                <Route path="/admin/*" element={<SystemAdminDashboard />} />
              )}
              {user.role === "org_admin" && (
                <Route path="/dashboard/*" element={<OrgAdminDashboard />} />
              )}
              {user.role === "member" && (
                <Route path="/dashboard" element={<MemberDashboard />} />
              )}
              <Route
                path="*"
                element={
                  <Navigate
                    to={user.role === "system_admin" ? "/admin" : "/dashboard"}
                    replace
                  />
                }
              />
            </>
          ) : (
            <>
              <Route
                path="/"
                element={
                  <Landing
                    onRoleSelect={(role) => {
                      if (role === "login") navigate("/login");
                      if (role === "org_admin")
                        navigate("/signup/organization");
                      if (role === "member") navigate("/invite/some-token"); // Or a dedicated page
                    }}
                  />
                }
              />
              <Route
                path="/login"
                element={<LoginForm onBack={() => navigate("/")} />}
              />
              <Route
                path="/signup/organization"
                element={<OrgAdminSignup onBack={() => navigate("/")} />}
              />
              <Route path="/invite/:token" element={<InviteWrapper />} />
              <Route
                path="/signup/member/:token"
                element={(function MemberSignupWrapper() {
                  const { token } = useParams();
                  const location = useLocation() as { state?: { inviteData?: any } };
                  const inviteData = location.state?.inviteData;
                  return (
                    <MemberSignup
                      token={token!}
                      inviteData={inviteData}
                      onBack={() => navigate("/")}
                    />
                  );
                })()}
              />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
      {toasts.length > 0 && (
        <div className="fixed top-5 right-5 z-50">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default App;
