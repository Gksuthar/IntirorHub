import React, { useState, useMemo } from "react";
import { X, Search, Plus } from "lucide-react";

interface SiteItem {
  id: string;
  name: string;
  description?: string;
}

interface SiteSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sites: SiteItem[];
  activeSiteId?: string;
  onSwitchSite: (siteId: string) => void;
  onCreateSite: () => void;
}

const SiteSidebar: React.FC<SiteSidebarProps> = ({ isOpen, onClose, sites, activeSiteId, onSwitchSite, onCreateSite }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return sites;
    const q = query.toLowerCase();
    return sites.filter(s => s.name.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q));
  }, [sites, query]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <aside className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-right-2 duration-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold">Manage Sites</h2>
            <p className="text-xs text-gray-500 mt-1">Switch between sites or create a new one</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCreateSite}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Create
            </button>
            <button onClick={onClose} aria-label="Close sidebar" className="text-gray-500 hover:text-gray-900 p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="relative block">
            <span className="sr-only">Search sites</span>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search sites..."
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Your Sites</h3>
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="text-sm text-gray-500">No sites found.</div>
            )}
            {filtered.map((site) => {
              const isCurrent = activeSiteId === site.id;
              return (
                <button
                  key={site.id}
                  onClick={() => { onSwitchSite(site.id); onClose(); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${isCurrent ? "bg-gray-900 text-white" : "hover:bg-gray-50 text-gray-900"}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isCurrent ? "bg-white/10" : "bg-gray-100"}`}>
                    <span className={`font-semibold ${isCurrent ? "text-white" : "text-gray-900"}`}>{site.name.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium truncate">{site.name}</div>
                    {site.description && <div className={`text-xs truncate ${isCurrent ? "text-white/80" : "text-gray-500"}`}>{site.description}</div>}
                  </div>
                  {isCurrent ? (
                    <div className="text-xs px-2 py-0.5 rounded-full bg-white/10">Active</div>
                  ) : (
                    <div className="text-xs text-gray-400">Switch</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={onCreateSite}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Site</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default SiteSidebar;
