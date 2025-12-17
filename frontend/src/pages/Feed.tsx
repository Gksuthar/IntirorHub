import React, { useState } from "react";
import {
  MessageSquare,
  Image,
  FileText,
  ThumbsUp,
  Send,
  MoreHorizontal,
  Camera,
  Paperclip,
} from "lucide-react";

interface FeedItem {
  id: number;
  user: {
    name: string;
    role: string;
    avatar: string;
  };
  type: "update" | "photo" | "document" | "milestone";
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: number;
}

const Feed: React.FC = () => {
  const [newPost, setNewPost] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const feedItems: FeedItem[] = [
    {
      id: 1,
      user: {
        name: "Rajesh Kumar",
        role: "Site Manager",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
      },
      type: "photo",
      content:
        "Flooring work completed in master bedroom. Quality check done ✅",
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
        "https://images.unsplash.com/photo-1600573472591-ee6c563b7789?w=400",
      ],
      timestamp: "2 hours ago",
      likes: 12,
      comments: 4,
    },
    {
      id: 2,
      user: {
        name: "Amit Shah",
        role: "Admin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
      },
      type: "milestone",
      content:
        "🎉 Milestone achieved! Electrical work completed ahead of schedule. Great job team!",
      timestamp: "5 hours ago",
      likes: 24,
      comments: 8,
    },
    {
      id: 3,
      user: {
        name: "Priya Patel",
        role: "Agent",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
      },
      type: "update",
      content:
        "Material delivery scheduled for tomorrow. Tiles and sanitary items arriving at 10 AM.",
      timestamp: "Yesterday",
      likes: 5,
      comments: 2,
    },
    {
      id: 4,
      user: {
        name: "Suresh Contractor",
        role: "Contractor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh",
      },
      type: "photo",
      content: "Kitchen platform work in progress. Will complete by end of week.",
      images: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      ],
      timestamp: "2 days ago",
      likes: 8,
      comments: 3,
    },
    {
      id: 5,
      user: {
        name: "Admin",
        role: "Admin",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      },
      type: "document",
      content: "Updated BOQ document uploaded. Please review the changes in plumbing section.",
      timestamp: "3 days ago",
      likes: 3,
      comments: 6,
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <Image className="h-4 w-4 text-green-500" />;
      case "document":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "milestone":
        return <span className="text-yellow-500">🏆</span>;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 md:px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Feed</h1>
        <p className="text-gray-600 mt-1">
          Stay updated with project activities and updates
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Create Post */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-start gap-3">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dev"
              alt="User"
              className="h-10 w-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share an update..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <Camera className="h-5 w-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                    <Paperclip className="h-5 w-5" />
                  </button>
                </div>
                <button className="btn-primary flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "updates", "photos", "documents", "milestones"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Feed Items */}
        <div className="space-y-4">
          {feedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {item.user.name}
                      </span>
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{item.user.role}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <p className="text-gray-800 mb-3">{item.content}</p>

              {/* Images */}
              {item.images && item.images.length > 0 && (
                <div
                  className={`grid gap-2 mb-3 ${
                    item.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  }`}
                >
                  {item.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="rounded-lg w-full h-48 object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="h-5 w-5" />
                    <span className="text-sm">{item.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm">{item.comments}</span>
                  </button>
                </div>
                <button className="text-sm text-gray-500 hover:text-blue-600">
                  View Comments
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-6">
          <button className="btn-outline">Load More</button>
        </div>
      </div>
    </div>
  );
};

export default Feed;
