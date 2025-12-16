import React from "react";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  FileText,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Zap,
  Target,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Home: React.FC = () => {
     const progress = 62;
  const daysLeft = 68;

  const stats = [
    {
      title: "Total Budget",
      value: "₹45,50,000",
      change: "+12%",
      trend: "up",
      icon: IndianRupee,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
    },
    {
      title: "Amount Spent",
      value: "₹28,32,500",
      change: "62.2%",
      trend: "up",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      title: "Pending Payments",
      value: "₹8,45,000",
      change: "5 invoices",
      trend: "down",
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
    },
    {
      title: "Active Workers",
      value: "24",
      change: "+3 this week",
      trend: "up",
      icon: Users,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
    },
  ];

  const recentActivities = [
    { id: 1, type: "payment", title: "Payment to Raj Electricals", amount: "₹45,000", status: "completed", time: "2 hours ago", icon: "💰" },
    { id: 2, type: "boq", title: "BOQ updated for Kitchen Work", amount: "₹1,25,000", status: "pending", time: "4 hours ago", icon: "📋" },
    { id: 3, type: "expense", title: "Material Purchase - Tiles", amount: "₹78,500", status: "completed", time: "Yesterday", icon: "🧱" },
    { id: 4, type: "payment", title: "Advance to Contractor", amount: "₹2,00,000", status: "pending", time: "2 days ago", icon: "👷" },
  ];

  const workProgress = [
    { name: "Flooring", progress: 85, color: "from-blue-500 to-indigo-500" },
    { name: "Electrical", progress: 65, color: "from-emerald-500 to-teal-500" },
    { name: "Plumbing", progress: 90, color: "from-purple-500 to-pink-500" },
    { name: "Painting", progress: 40, color: "from-amber-500 to-orange-500" },
    { name: "Kitchen", progress: 55, color: "from-rose-500 to-red-500" },
  ];

  const quickActions = [
    { label: "Add Payment", icon: IndianRupee, gradient: "from-blue-500 to-indigo-600" },
    { label: "Update BOQ", icon: FileText, gradient: "from-purple-500 to-pink-600" },
    { label: "Log Expense", icon: TrendingUp, gradient: "from-emerald-500 to-teal-600" },
    { label: "Add Worker", icon: Users, gradient: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-24 lg:pb-8 px-4 md:px-8">
      {/* Welcome Section */}
     <div className="relative overflow-hidden bg-[#FAFAFA] rounded-3xl p-8 md:p-10 mb-8 shadow-sm">

      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">

        {/* LEFT SECTION */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {daysLeft} Days Left
          </h1>

          <p className="text-gray-600 mb-1">
            <span className="mr-2">🛠</span>
            <strong>Current Stage:</strong> Carpentry Work
          </p>

          <p className="text-gray-600 mb-4">
            <span className="mr-2">➡️</span>
            <strong>Next Stage:</strong> Finishing
          </p>

          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-500">Project Progress</span>
            <span className="font-semibold text-gray-800">
              {progress}% Completed
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-gray-500 mt-4 text-sm">
            Expected Completion:{" "}
            <strong className="text-gray-700">25 Dec 2025</strong>
          </p>
        </div>

        {/* RIGHT CIRCULAR PROGRESS */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="#14b8a6"
                strokeWidth="8"
                fill="none"
                strokeDasharray="326"
                strokeDashoffset={326 - (326 * progress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-gray-900">{progress}%</p>
              <p className="text-sm text-gray-500">Complete</p>
            </div>
          </div>
        </div> 

      </div>
    </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="group relative bg-white rounded-2xl p-6 border border-gray-900 hover:shadow-2xl hover:shadow-gray-900/20 transition-all duration-500 cursor-pointer overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a1a1a]"></div>
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-gray-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#1a1a1a]">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${stat.trend === "up" ? "bg-gray-100 text-gray-900" : "bg-gray-100 text-gray-900"}`}>
                    {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-500 font-medium">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-900 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-xl">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
              </div>
              <button className="flex items-center gap-1 text-gray-900 text-sm font-semibold hover:text-gray-700 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity, index) => (
              <div key={activity.id} className="p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{activity.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{activity.amount}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${activity.status === "completed" ? "bg-[#1a1a1a] text-white" : "bg-gray-200 text-gray-900"}`}>
                      {activity.status === "completed" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Progress */}
        <div className="bg-white rounded-2xl border border-gray-900 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-xl">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Work Progress</h2>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {workProgress.map((work, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">{work.name}</span>
                  <span className="text-sm font-bold text-gray-900">{work.progress}%</span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-[#14b8a6] rounded-full transition-all duration-1000" style={{ width: `${work.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-black" />
                <span className="font-semibold text-gray-700">Overall Progress</span>
              </div>
              <span className="text-2xl font-bold text-black">67%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-black" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button key={index} className="group relative p-6 bg-[#1a1a1a] rounded-2xl text-white overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-sm">{action.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white rounded-2xl border border-gray-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-xl">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Upcoming Milestones</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#14b8a6] animate-pulse"></div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">Flooring Complete</p>
                <p className="text-sm text-gray-500">Dec 20</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-black animate-pulse"></div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">Electrical Sign-off</p>
                <p className="text-sm text-gray-500">Dec 25</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-black animate-pulse"></div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">Final Inspection</p>
                <p className="text-sm text-gray-500">Jan 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
