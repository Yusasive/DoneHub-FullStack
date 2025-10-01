import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { OrgAdminSignup } from './pages/OrgAdminSignup';
import { MemberSignup } from './pages/MemberSignup';
import { SignupSuccess } from './pages/SignupSuccess';
import { SystemAdminDashboard } from './pages/SystemAdminDashboard';
import { OrgAdminDashboard } from './pages/OrgAdminDashboard';
import { MemberDashboard } from './pages/MemberDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'system_admin':
      return <SystemAdminDashboard />;
    case 'org_admin':
      return <OrgAdminDashboard />;
    case 'member':
      return <MemberDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/org-admin" element={<OrgAdminSignup />} />
            <Route path="/signup/member" element={<MemberSignup />} />
            <Route path="/signup-success" element={<SignupSuccess />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
