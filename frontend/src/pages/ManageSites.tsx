import React from "react";
import { useSite } from "../context/SiteContext";
import { useAuth } from "../context/AuthContext";
import { Plus, Building2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ManageSites: React.FC = () => {
  const { sites, activeSite, setActiveSite, openCreateSite } = useSite();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to manage sites.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-7 w-7 text-gray-900" />
                Manage Sites
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create, switch, and organize your workspace sites
              </p>
            </div>
            <button
              onClick={openCreateSite}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold shadow-sm transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Site</span>
            </button>
          </div>
        </div>


        {/* Sites Grid */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Sites</h2>
          
          {sites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No sites yet. Create your first site to get started.</p>
              <button
                onClick={openCreateSite}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium"
              >
                <Plus className="h-4 w-4" />
                Create Site
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map((site) => {
                const isCurrent = activeSite?.id === site.id;
                return (
                  <div
                    key={site.id}
                    className={`relative group rounded-xl p-6 transition-all border-2 ${
                      isCurrent
                        ? "bg-gray-50 border-gray-900 shadow-md"
                        : "bg-white border-gray-200 hover:border-gray-400 hover:shadow-sm"
                    }`}
                  >
                    {/* Active Badge */}
                    {isCurrent && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900 text-white text-xs font-semibold">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      </div>
                    )}

                    {/* Site Icon */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`flex-shrink-0 h-16 w-16 rounded-xl flex items-center justify-center ${
                          isCurrent ? "bg-gray-900" : "bg-gradient-to-br from-gray-700 to-gray-900"
                        }`}
                      >
                        <span className="text-xl font-bold text-white">
                          {site.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-lg truncate ${
                            isCurrent ? "text-gray-900" : "text-gray-900"
                          }`}
                        >
                          {site.name}
                        </h3>
                        {site.description && (
                          <p
                            className={`text-sm mt-1 line-clamp-2 ${
                              isCurrent ? "text-gray-600" : "text-gray-500"
                            }`}
                          >
                            {site.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4">
                      {isCurrent ? (
                        <div className="w-full text-center py-2 text-sm font-medium text-gray-900">
                          Currently Active
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveSite(site.id)}
                          className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all"
                        >
                          Switch to this Site
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSites;
