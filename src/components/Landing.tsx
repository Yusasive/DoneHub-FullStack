import React from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { 
  Building, 
  Users, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Settings,
  UserCheck,
  Mail
} from 'lucide-react';

interface LandingProps {
  onRoleSelect: (role: 'org_admin' | 'member' | 'login') => void;
}

export const Landing: React.FC<LandingProps> = ({ onRoleSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DoneHub</h1>
                <p className="text-sm text-gray-600">Modern Team Management</p>
              </div>
            </div>
            <Button onClick={() => onRoleSelect('login')} variant="outline">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Modern Team
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Onboarding & Management
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Say goodbye to invitation codes and complex setups. DoneHub provides a streamlined, 
              secure way to manage organizations and teams with self-service signup and admin approval workflows.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                onClick={() => onRoleSelect('org_admin')}
                className="px-8 py-4 text-lg"
              >
                Start Your Organization
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => onRoleSelect('member')}
                className="px-8 py-4 text-lg"
              >
                Join with Invite Link
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center hover:shadow-xl transition-all duration-300">
                <CardContent className="py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Compliant</h3>
                  <p className="text-gray-600">
                    Enterprise-grade security with role-based access control and approval workflows
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300">
                <CardContent className="py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                  <p className="text-gray-600">
                    Self-service signup with instant notifications and streamlined approval process
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300">
                <CardContent className="py-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Focused</h3>
                  <p className="text-gray-600">
                    Built for modern teams with intuitive member management and collaboration tools
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How DoneHub Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, three-step process that gets your team up and running in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Settings className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Request Organization</h3>
                <p className="text-gray-600">
                  Sign up as an Organization Admin. Provide your organization details and wait for system admin approval.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-10 left-full w-8 h-8 transform translate-x-4">
                <ArrowRight className="w-full h-full text-gray-300" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <UserCheck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Get Approved</h3>
                <p className="text-gray-600">
                  System administrator reviews your request and approves your organization. You'll receive email confirmation.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-10 left-full w-8 h-8 transform translate-x-4">
                <ArrowRight className="w-full h-full text-gray-300" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Mail className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Invite Your Team</h3>
              <p className="text-gray-600">
                Send secure invite links to team members. They can join instantly with a simple signup process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose DoneHub?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Modern features designed for today's distributed teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: 'No More Codes', desc: 'Eliminate clunky invitation codes' },
              { icon: Shield, title: 'Secure by Default', desc: 'Built-in approval workflows' },
              { icon: Zap, title: 'Instant Setup', desc: 'Get started in under 5 minutes' },
              { icon: Users, title: 'Scale Ready', desc: 'Handle hundreds of organizations' },
            ].map((feature, index) => (
              <Card key={index} className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="text-center py-6">
                  <feature.icon className="h-10 w-10 text-white mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-100 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the modern way of team management. No setup fees, no complex configurations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => onRoleSelect('org_admin')}
              className="px-8 py-4 text-lg"
            >
              Start Your Organization
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => onRoleSelect('member')}
              className="px-8 py-4 text-lg"
            >
              Join Existing Team
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">DoneHub</span>
          </div>
          <p className="text-gray-400">
            Modern team onboarding and management platform
          </p>
        </div>
      </footer>
    </div>
  );
};