import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import CreateSiteModal from "../component/CreateSiteModal";
import { siteApi } from "../services/api";

export interface Site {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
}

interface CreateSiteInput {
  name: string;
  description?: string;
  image?: string;
}

interface SiteContextValue {
  sites: Site[];
  activeSite: Site | null;
  setActiveSite: (siteId: string) => void;
  addSite: (input: CreateSiteInput) => Promise<void>;
  openCreateSite: () => void;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

const buildStorageKey = (userKey: string, suffix = "sites") => `sitezero:${userKey}:${suffix}`;

const createDefaultSite = (name: string): Site => ({
  id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
  name,
  description: "Primary workspace",
  createdAt: new Date().toISOString(),
});

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const userKey = useMemo(() => {
    if (!user) {
      return null;
    }
    return user._id ?? user.email ?? "anonymous";
  }, [user]);

  const activeKey = useMemo(() => (userKey ? buildStorageKey(userKey, "active-site") : null), [userKey]);

  useEffect(() => {
    const fetchSites = async () => {
      if (!user || !token) {
        setSites([]);
        setActiveSiteId(null);
        return;
      }

      try {
        const response = await siteApi.listSites(token);
        const apiSites: Site[] = response.sites.map((site) => ({
          id: site.id,
          name: site.name,
          description: site.description,
          image: site.image,
          createdAt: site.createdAt,
        }));

        const normalizedSites = apiSites.length
          ? apiSites
          : [createDefaultSite(user.companyName || "Primary workspace")];

        setSites(normalizedSites);

        if (activeKey) {
          const storedActive = localStorage.getItem(activeKey);
          const initialActive =
            normalizedSites.find((site) => site.id === storedActive)?.id || normalizedSites[0].id;
          setActiveSiteId(initialActive);
        } else {
          setActiveSiteId(normalizedSites[0]?.id ?? null);
        }
      } catch (error) {
        console.warn("Unable to load sites from API", error);
        const fallback = [createDefaultSite(user?.companyName || "Primary workspace")];
        setSites(fallback);
        setActiveSiteId(fallback[0].id);
      }
    };

    fetchSites();
  }, [activeKey, token, user]);

  useEffect(() => {
    if (!activeKey || !activeSiteId) {
      return;
    }
    localStorage.setItem(activeKey, activeSiteId);
  }, [activeKey, activeSiteId]);

  const addSite = useCallback(
    async (input: CreateSiteInput) => {
      if (!user || !token) {
        return;
      }

      try {
        const response = await siteApi.createSite(
          {
            name: input.name,
            description: input.description,
            image: input.image,
          },
          token
        );

        const created: Site = {
          id: response.site.id,
          name: response.site.name,
          description: response.site.description,
          image: response.site.image,
          createdAt: response.site.createdAt,
        };

        setSites((prev) => [created, ...prev]);
        setActiveSiteId(created.id);
      } catch (error) {
        console.error("addSite error", error);
      }
    },
    [token, user]
  );

  const activeSite = useMemo(() => {
    if (!sites.length) {
      return null;
    }
    if (activeSiteId) {
      const match = sites.find((site) => site.id === activeSiteId);
      if (match) {
        return match;
      }
    }
    return sites[0];
  }, [activeSiteId, sites]);

  const openCreateSite = useCallback(() => setIsCreateModalOpen(true), []);
  const closeCreateSite = useCallback(() => setIsCreateModalOpen(false), []);

  const handleCreateSite = useCallback(
    async (input: CreateSiteInput) => {
      await addSite(input);
      closeCreateSite();
    },
    [addSite, closeCreateSite]
  );

  const value = useMemo<SiteContextValue>(
    () => ({
      sites,
      activeSite,
      setActiveSite: setActiveSiteId,
      addSite,
      openCreateSite,
    }),
    [activeSite, addSite, openCreateSite, sites]
  );

  return (
    <SiteContext.Provider value={value}>
      {children}
      <CreateSiteModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateSite}
        onCreate={handleCreateSite}
      />
    </SiteContext.Provider>
  );
};

export const useSite = (): SiteContextValue => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
};
