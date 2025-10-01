import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to DoneHub
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-green-50">
            Modern Organization Management & Onboarding Platform
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="lg"
              className="w-64 bg-white text-primary hover:bg-gray-50 border-white"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/signup/org-admin')}
              size="lg"
              className="w-64 bg-white text-primary hover:bg-gray-50"
            >
              Sign Up as Org Admin
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Fast Onboarding</h3>
              <p className="text-green-50">
                Get your organization set up quickly with our streamlined approval process
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
              <p className="text-green-50">
                Controlled invitations and admin approvals ensure your organization stays secure
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Team Management</h3>
              <p className="text-green-50">
                Easily invite and manage team members with role-based access control
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
