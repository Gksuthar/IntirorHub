import React from "react";
import { useSite } from "../context/SiteContext";
import { useAuth } from "../context/AuthContext";
import { Plus } from "lucide-react";

const Settings: React.FC = () => {
  const { sites, activeSite, setActiveSite, openCreateSite } = useSite();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-sm text-gray-500">Manage account and workspace settings</p>
          </div>
          <div>
            <button
              onClick={openCreateSite}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Create New Site
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Workspace</h2>
          {!isAdmin && (
            <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-600">You don't have workspace management permissions.</div>
          )}

          {isAdmin && (
            <div className="mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sites.map((site) => (
                  <div
                    key={site.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md shadow-sm transition ${
                      activeSite?.id === site.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 w-full">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${activeSite?.id === site.id ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <span className={`font-semibold ${activeSite?.id === site.id ? 'text-white' : 'text-gray-900'}`}>{site.name.slice(0,2).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{site.name}</div>
                        {site.description && (
                          <div className={`text-xs truncate ${activeSite?.id === site.id ? 'text-white/80' : 'text-gray-500'}`}>{site.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {activeSite?.id === site.id ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-xs">Active</span>
                      ) : (
                        <button
                          onClick={() => setActiveSite(site.id)}
                          className="px-3 py-1 rounded-md border border-blue-200 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
