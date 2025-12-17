import React from "react";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
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
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Amount Spent",
      value: "₹28,32,500",
      change: "62.2%",
      trend: "up",
      icon: TrendingUp,
      accent: "bg-sky-500/10 text-sky-600",
    },
    {
      title: "Pending Payments",
      value: "₹8,45,000",
      change: "5 invoices",
      trend: "down",
      icon: Clock,
      accent: "bg-amber-500/10 text-amber-600",
    },
    {
      title: "Active Workers",
      value: "24",
      change: "+3 this week",
      trend: "up",
      icon: Users,
      accent: "bg-indigo-500/10 text-indigo-600",
    },
  ];

  const recentActivities = [
    { id: 1, type: "payment", title: "Payment to Raj Electricals", amount: "₹45,000", status: "completed", time: "2 hours ago", icon: "💰" },
    { id: 2, type: "boq", title: "BOQ updated for Kitchen Work", amount: "₹1,25,000", status: "pending", time: "4 hours ago", icon: "📋" },
    { id: 3, type: "expense", title: "Material Purchase - Tiles", amount: "₹78,500", status: "completed", time: "Yesterday", icon: "🧱" },
    { id: 4, type: "payment", title: "Advance to Contractor", amount: "₹2,00,000", status: "pending", time: "2 days ago", icon: "👷" },
  ];

  const workProgress = [
    { name: "Flooring", progress: 85 },
    { name: "Electrical", progress: 65 },
    { name: "Plumbing", progress: 90 },
    { name: "Painting", progress: 40 },
    { name: "Kitchen", progress: 55 },
  ];

  const quickActions = [
    { label: "Add Payment", icon: IndianRupee },
    { label: "Update BOQ", icon: FileText },
    { label: "Log Expense", icon: TrendingUp },
    { label: "Add Worker", icon: Users },
  ];

  return (
    <div className="min-h-screen pt-20 pb-24 lg:pb-12 px-4 md:px-8 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Welcome Section */}
     <div className="relative overflow-hidden bg-white rounded-3xl p-8 md:p-10 mb-8 shadow-md shadow-slate-200 border border-slate-100">

      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.08'%3E%3Cpath d='M40 38v-6h-2v6h-6v2h6v6h2v-6h6v-2h-6zm0-32V0h-2v6h-6v2h6v6h2V8h6V6h-6zM8 38v-6H6v6H0v2h6v6h2v-6h6v-2H8zM8 6V0H6v6H0v2h6v6h2V8h6V6H8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">

        {/* LEFT SECTION */}
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3">
            {daysLeft} Days Left
          </h1>

          <p className="text-slate-600 mb-1 text-sm md:text-base flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 text-base">🛠</span>
            <span className="font-semibold text-slate-700">Current Stage:</span> Carpentry Work
          </p>

          <p className="text-slate-600 mb-4 text-sm md:text-base flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 text-base">➡️</span>
            <span className="font-semibold text-slate-700">Next Stage:</span> Finishing
          </p>

          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-slate-500">Project Progress</span>
            <span className="font-semibold text-slate-800">
              {progress}% Completed
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-slate-500 mt-4 text-sm">
            Expected Completion:{" "}
            <strong className="text-slate-700">25 Dec 2025</strong>
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
                stroke="#0ea5e9"
                strokeWidth="8"
                fill="none"
                strokeDasharray="326"
                strokeDashoffset={326 - (326 * progress) / 100}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-slate-900">{progress}%</p>
              <p className="text-sm text-slate-500">Complete</p>
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
            <div key={index} className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-200/40 transition-all duration-300 cursor-pointer overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-60 group-hover:scale-150 transition-all duration-500"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-slate-50 text-slate-700 shadow-sm`}> 
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.accent}`}>
                    {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                  <Zap className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Recent Activities</h2>
              </div>
              <button className="flex items-center gap-1 text-slate-600 text-sm font-semibold hover:text-slate-900 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{activity.icon}</div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">{activity.title}</p>
                      <p className="text-sm text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{activity.amount}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${activity.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
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
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 rounded-xl text-sky-600">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Work Progress</h2>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {workProgress.map((work, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700">{work.name}</span>
                  <span className="text-sm font-semibold text-slate-900">{work.progress}%</span>
                </div>
                <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full transition-all duration-700" style={{ width: `${work.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold text-slate-700">Overall Progress</span>
              </div>
              <span className="text-2xl font-semibold text-slate-900">67%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button key={index} className="group relative p-6 bg-white rounded-2xl text-slate-900 border border-slate-200 overflow-hidden hover:border-emerald-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors"></div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-100/40 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-sm">{action.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Upcoming Milestones</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-200 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Flooring Complete</p>
                <p className="text-sm text-slate-500">Dec 20</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-200 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse"></div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Electrical Sign-off</p>
                <p className="text-sm text-slate-500">Dec 25</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-200 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Final Inspection</p>
                <p className="text-sm text-slate-500">Jan 5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
