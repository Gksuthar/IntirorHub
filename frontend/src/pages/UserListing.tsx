import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRelatedUsers } from "../component/useRelatedUsers";
import { Mail, User, Trash2 } from "lucide-react";
import { userApi } from "../services/api";

const UserListing: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const { users, loading, error, refetch } = useRelatedUsers(token ?? undefined);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "ADMIN";

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!token) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`);
    if (!confirmDelete) return;

    setDeletingUserId(userId);
    try {
      await userApi.deleteUser(userId, token);
      alert(`User ${userName} has been deleted successfully.`);
      refetch(); // Refresh the user list
    } catch (err: any) {
      alert(err?.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

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
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 relative"
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white">
                    {user.role}
                  </span>
                  
                  {/* Joined Date */}
                  <p className="text-xs text-gray-400 mt-3">
                    Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>

                  {/* Delete Button (Admin only) */}
                  {isAdmin && user.id !== currentUser?._id && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={deletingUserId === user.id}
                      className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingUserId === user.id ? "Deleting..." : "Delete User"}
                    </button>
                  )}
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
