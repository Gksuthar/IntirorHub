import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Users, FileText, TrendingUp } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-2">
              <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-slate-900" />
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                SiteZero
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-3 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-lg transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
            Manage Your
            <span className="text-slate-900">
              {' '}Construction Sites{' '}
            </span>
            Effortlessly
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 sm:mb-12 leading-relaxed px-4">
            The all-in-one platform for contractors, site managers, and teams to collaborate, track progress, and deliver projects on time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xl transition-all transform hover:scale-105"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-slate-900 bg-white hover:bg-slate-50 rounded-xl shadow-xl transition-all border border-slate-900"
            >
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Task Management</h3>
            <p className="text-slate-600 text-sm">
              Track tasks, assign responsibilities, and monitor progress in real-time.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Team Collaboration</h3>
            <p className="text-slate-600 text-sm">
              Invite team members, share updates, and communicate seamlessly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">BOQ Management</h3>
            <p className="text-slate-600 text-sm">
              Create detailed bills of quantities and manage expenses efficiently.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Progress Tracking</h3>
            <p className="text-slate-600 text-sm">
              Visualize project progress with intuitive dashboards and reports.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center text-slate-600 text-sm">
            <p>&copy; 2024 SiteZero. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
