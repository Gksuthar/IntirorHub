import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { useAuth } from "../context/AuthContext";
import { feedApi } from "../services/api";
import {
  FileText,
  IndianRupee,
  Clock,
} from "lucide-react";

interface FeedItem {
  id: string;
  user: {
    name: string;
    role: string;
    avatar: string;
  };
  type: "update" | "photo" | "document" | "milestone";
  title?: string;
  content: string;
  timestamp: string;
  siteName?: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { activeSite } = useSite();
  const { token } = useAuth();
  const [recentFeeds, setRecentFeeds] = useState<FeedItem[]>([]);
  const progress = 62;
  const daysLeft = 68;

  useEffect(() => {
    const loadRecentFeeds = async () => {
      if (!token || !activeSite?.id) {
        setRecentFeeds([]);
        return;
      }

      try {
        const response = await feedApi.listFeed(activeSite.id, token);
        const feeds = response.items.slice(0, 3).map((item: any) => ({
          id: item.id,
          user: item.user,
          type: item.type,
          title: item.title || "",
          content: item.content,
          timestamp: item.timestamp,
          siteName: item.siteName,
        }));
        setRecentFeeds(feeds);
      } catch (err) {
        console.error("Failed to load recent feeds", err);
        setRecentFeeds([]);
      }
    };

    loadRecentFeeds();
  }, [activeSite, token]);

  const getIconForFeed = (item: FeedItem) => {
    if (item.type === "photo") return "🖼️";
    if (item.type === "document") return "📄";
    if (item.type === "milestone") return "🏆";
    return "⚡";
  };

  const getBgForFeed = (item: FeedItem) => {
    if (item.type === "photo") return "bg-amber-100";
    if (item.type === "document") return "bg-blue-100";
    if (item.type === "milestone") return "bg-green-100";
    return "bg-sky-100";
  };

  return (
    <div className="min-h-screen pt-20 pb-24 lg:pb-12 px-4 md:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 mb-6 shadow-sm">
          {/* Top Section with Progress Circle */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Circular Progress */}
            <div className="flex-shrink-0 reletive">
              <div className="relative absolute left-16  w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="314"
                    strokeDashoffset={314 - (314 * progress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute left inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-slate-900">{daysLeft}</p>
                  <p className="text-xs text-slate-500">Days Left</p>
                </div>
              </div>
            </div>

            {/* Stage Info */}
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">Current Stage</p>
                <h2 className="text-2xl font-semibold text-slate-900">Carpentry Work</h2>
              </div>
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-1">Next Stage</p>
                <h3 className="text-lg font-medium text-indigo-600">Finishing</h3>
              </div>
            </div>
          </div>

          {/* Project Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Project Progress</span>
              <span className="text-sm font-semibold text-slate-900">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-slate-900 h-2.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Expected Completion: <span className="font-semibold text-slate-700">25 Dec 2025</span>
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Budget */}
            <div className="text-center p-4 border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Budget</p>
              <p className="text-2xl font-bold text-slate-900">₹15.8L</p>
              <p className="text-xs text-slate-500">of ₹25L</p>
            </div>

            {/* Approvals */}
            <div className="text-center p-4 border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Approvals</p>
              <p className="text-2xl font-bold text-orange-500">2</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>

            {/* Health */}
            <div className="text-center p-4 border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Health</p>
              <p className="text-2xl font-bold text-emerald-500">92%</p>
              <p className="text-xs text-slate-500">On Track</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
            
            {/* Add Site Update - Full Width Dark Button */}
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
              <FileText className="h-5 w-5" />
              Add Site Update
            </button>

            {/* Two Column Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white hover:bg-slate-50 text-slate-900 font-medium py-4 px-6 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Add Expense
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-900 font-medium py-4 px-6 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2">
                <FileText className="h-5 w-5" />
                Add BOQ Item
              </button>
            </div>
          </div>
        </div>

        {/* Recent Site Updates */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Site Updates</h3>
            <button 
              onClick={() => navigate('/home/feed')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All →
            </button>
          </div>

          {recentFeeds.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No recent updates. Share the first update!</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentFeeds.map((feed) => (
                <div
                  key={feed.id}
                  className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${getBgForFeed(feed)} rounded-xl flex items-center justify-center text-xl sm:text-2xl`}>
                    {getIconForFeed(feed)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base text-slate-900 truncate">
                      {feed.title || feed.content.slice(0, 50) + (feed.content.length > 50 ? "..." : "")}
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mt-1">
                      <span className="truncate max-w-[120px] sm:max-w-none">{feed.user.name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="truncate">{feed.timestamp}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
