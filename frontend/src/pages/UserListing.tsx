import React from "react";
import { useAuth } from "../context/AuthContext";
import { useRelatedUsers } from "../component/useRelatedUsers";
import { Mail, User } from "lucide-react";

const UserListing: React.FC = () => {
  const { token } = useAuth();
  const { users, loading, error } = useRelatedUsers(token ?? undefined);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Team Members
          </h1>
          <p className="text-gray-600">
            All users in your company
          </p>
        </div>

        {/* User Cards Grid */}
        {users.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No team members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-20 w-20 rounded-full mb-4"
                  />
                  
                  {/* Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {user.name}
                  </h3>
                  
                  {/* Email */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate max-w-full">{user.email}</span>
                  </div>
                  
                  {/* Role Badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white">
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-500">{user.siteAccessCount ?? 0} sites</span>
                  </div>
                  
                  {/* Joined Date */}
                  <p className="text-xs text-gray-400 mt-3">
                    Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListing;
