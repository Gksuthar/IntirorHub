import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { useAuth } from "../context/AuthContext";
import { feedApi } from "../services/api";

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

  const getRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMins > 0) return `${diffMins}m ago`;
      return "just now";
    } catch {
      return timestamp;
    }
  };
// inline-flex items-center px-2 py-1  rounded-lg text-xs font-medium mt-1
  return (
    <>
      {/* Main Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm max-w-2xl  mx-auto mt-20 mb-8">
        {/* Last Updated */}
        <p className="text-xs text-slate-400 mb-4 text-center sm:text-left">Last updated 8 minutes ago</p>
        
        {/* Top Section with Progress Circle */}
          <div className="flex items-start gap-6 sm:gap-8 mb-8">
            {/* Circular Progress */}
            <div className="flex-shrink-0">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="314"
                    strokeDashoffset={314 - (314 * progress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900">{daysLeft}</p>
                  <p className="text-xs text-slate-400">Days Left</p>
                </div>
              </div>
            </div>

            {/* Stage Info */}
            <div className="flex-1">
              <div className="mb-5">
                <p className="text-xs text-slate-400 mb-1.5">Current Stage</p>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Carpentry Work</h2>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Next Stage</p>
                <h3 className="text-base sm:text-lg font-medium text-indigo-600">Finishing</h3>
              </div>
            </div>
          </div>

          {/* Project Progress Bar */}
          <div className="mb-8 pb-8 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-medium text-slate-700">Project Progress</span>
              <span className="text-sm font-bold text-slate-900">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-slate-900 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2.5">
              Expected Completion: <span className="font-medium text-slate-600">25 Dec 2025</span>
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-100">
            {/* Budget */}
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-2">Budget</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">₹15.8L</p>
              <p className="text-xs text-slate-400 mt-1">of ₹25L</p>
            </div>

            {/* Approvals */}
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-2">Approvals</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-500">2</p>
              <p className="text-xs text-slate-400 mt-1">Pending</p>
            </div>

            {/* Health */}
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-2">Health</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-500">92%</p>
              <p className="text-xs text-slate-400 mt-1">On Track</p>
            </div>
          </div>
        </div>

        {/* Recent Site Updates */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-900">Recent Site Updates</h3>
            <button 
              onClick={() => navigate('/home/feed')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View All
            </button>
          </div>

          {recentFeeds.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No recent updates. Share the first update!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentFeeds.map((feed) => (
                <div
                  key={feed.id}
                  className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 flex-shrink-0 ${getBgForFeed(feed)} rounded-2xl flex items-center justify-center text-2xl`}>
                      {getIconForFeed(feed)}
                    </div>
                    <div className="flex-1  min-w-0">
                      <h4 className="font-medium text-base text-slate-900 mb-1 line-clamp-1 flex justify-start">
                        {feed.title || feed.content}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="truncate">{feed.user.name}</span>
                        <span>•</span>
                        <span className="flex-shrink-0">
                          {getRelativeTime(feed.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );
};

export default Home;
