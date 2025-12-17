type FilterKey = "all" | "updates" | "photos" | "documents" | "milestones";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquare,
  Image,
  FileText,
  ThumbsUp,
  Send,
  MoreHorizontal,
  Camera,
  Paperclip,
  Sparkles,
  MapPin,
  Clock,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSite } from "../context/SiteContext";
import { feedApi } from "../services/api";

interface FeedItem {
  id: string;
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
  siteName?: string;
}

const initialFeedItems: FeedItem[] = [];

const MAX_UPLOADS = 4;

const readFileAsDataUrl = (file: File): Promise<{ src: string; name: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: reader.result as string, name: file.name });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const generateId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const Feed: React.FC = () => {
  const { user, token } = useAuth();
  const { activeSite, sites, openCreateSite } = useSite();
  const [newPost, setNewPost] = useState("");
  const [selectedImages, setSelectedImages] = useState<Array<{ id: string; src: string; name: string }>>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialFeedItems);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const avatarSeed = encodeURIComponent(user?.email || user?.name || "You");
  const isAdmin = user?.role === "ADMIN";
  const activeSiteId = activeSite?.id ?? null;
  const isPostDisabled = (!newPost.trim() && selectedImages.length === 0) || !activeSiteId || isSubmitting;

  const filters: Array<{ key: FilterKey; label: string }> = useMemo(
        () => [
          { key: "all", label: "All" },
          { key: "updates", label: "Updates" },
          { key: "photos", label: "Photos" },
          { key: "documents", label: "Documents" },
          { key: "milestones", label: "Milestones" },
        ],
        []
      );

  const filteredItems = useMemo(() => {
        if (activeFilter === "all") {
          return feedItems;
        }

        return feedItems.filter((item) => {
          switch (activeFilter) {
            case "updates":
              return item.type === "update";
            case "photos":
              return item.type === "photo";
            case "documents":
              return item.type === "document";
            case "milestones":
              return item.type === "milestone";
            default:
              return true;
          }
        });
      }, [activeFilter, feedItems]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
          return;
        }

        const availableSlots = MAX_UPLOADS - selectedImages.length;
        if (availableSlots <= 0) {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        const chosenFiles = Array.from(files).slice(0, availableSlots);
        try {
          const payloads = await Promise.all(chosenFiles.map((file) => readFileAsDataUrl(file)));
          setSelectedImages((prev) => [
            ...prev,
            ...payloads.map((payload) => ({ id: generateId(), ...payload })),
          ]);
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };

  const handleRemoveImage = (id: string) => {
        setSelectedImages((prev) => prev.filter((image) => image.id !== id));
      };

  const handleSubmitPost = async () => {
        const content = newPost.trim();
        if (!content && selectedImages.length === 0) {
          return;
        }

        if (!token || !activeSiteId) {
          return;
        }

        setIsSubmitting(true);
        try {
          const response = await feedApi.createFeed(
            {
              siteId: activeSiteId,
              content,
              images: selectedImages.map((image) => image.src),
            },
            token
          );

          const created = response.item;

          const newItem: FeedItem = {
            id: created.id,
            user: created.user,
            type: created.type,
            content: created.content,
            images: created.images,
            timestamp: created.timestamp,
            likes: created.likes,
            comments: created.comments,
            siteName: created.siteName,
          };

          setFeedItems((prev) => [newItem, ...prev]);
          setNewPost("");
          setSelectedImages([]);
          setActiveFilter("all");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (err) {
          console.error("createFeed error", err);
        } finally {
          setIsSubmitting(false);
        }
      };

  useEffect(() => {
    const loadFeed = async () => {
      if (!token || !activeSiteId) {
        setFeedItems([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await feedApi.listFeed(activeSiteId, token);
        const items: FeedItem[] = response.items.map((item) => ({
          id: item.id,
          user: item.user,
          type: item.type,
          content: item.content,
          images: item.images,
          timestamp: item.timestamp,
          likes: item.likes,
          comments: item.comments,
          siteName: item.siteName,
        }));
        setFeedItems(items);
      } catch (err) {
        console.error("listFeed error", err);
        setError("Unable to load feed");
        setFeedItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [activeSiteId, token]);

  const getTypeIcon = (type: FeedItem["type"]) => {
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

  const otherSites = useMemo(
        () => sites.filter((site) => (activeSite ? site.id !== activeSite.id : true)),
        [activeSite, sites]
      );

  const activeSiteCreatedAt = activeSite
    ? new Date(activeSite.createdAt).toLocaleDateString()
    : null;

  return (
        <div className="min-h-screen bg-gray-50 px-4 pb-10 pt-24 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Feed</h1>
              <p className="text-sm text-gray-600">Stay updated with project activities and updates</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(280px,1fr)]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                      alt="User avatar"
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newPost}
                        onChange={(event) => setNewPost(event.target.value)}
                        placeholder="Share an update..."
                        className="h-28 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                      />

                      {selectedImages.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {selectedImages.map((image) => (
                            <div
                              key={image.id}
                              className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200"
                            >
                              <img src={image.src} alt={image.name} className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(image.id)}
                                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white shadow"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
                          >
                            <Camera className="h-4 w-4" />
                            Add photos
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
                          >
                            <Paperclip className="h-4 w-4" />
                            Attach file
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleSubmitPost}
                          disabled={isPostDisabled}
                          className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/40"
                        >
                          <Send className="h-4 w-4" />
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      className={`px-4 py-2 text-sm font-medium transition ${
                        activeFilter === filter.key
                          ? "rounded-full bg-black text-white"
                          : "rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {loading && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500">
                      Loading feed...
                    </div>
                  )}
                  {error && !loading && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  {!loading && !error && filteredItems.length === 0 && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500">
                      No posts yet for this site. Share the first update!
                    </div>
                  )}
                  {filteredItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <img
                            src={item.user.avatar}
                            alt={item.user.name}
                            className="h-10 w-10 rounded-full"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{item.user.name}</span>
                              {getTypeIcon(item.type)}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                              <span>{item.user.role}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {item.timestamp}
                              </span>
                            </div>
                            {item.siteName && (
                              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                                <MapPin className="h-3 w-3" />
                                {item.siteName}
                              </div>
                            )}
                          </div>
                        </div>
                        <button className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="mt-3 text-sm text-gray-800">{item.content}</p>

                      {item.images && item.images.length > 0 && (
                        <div
                          className={`mt-4 grid gap-2 ${item.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                        >
                          {item.images.map((image, index) => (
                            <img
                              key={`${item.id}-${index}`}
                              src={image}
                              alt={`Post asset ${index + 1}`}
                              className="h-48 w-full rounded-xl object-cover"
                            />
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-gray-500 transition hover:text-black">
                            <ThumbsUp className="h-5 w-5" />
                            <span className="text-sm">{item.likes}</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 transition hover:text-black">
                            <MessageSquare className="h-5 w-5" />
                            <span className="text-sm">{item.comments}</span>
                          </button>
                        </div>
                        <button className="text-sm font-medium text-gray-500 transition hover:text-black">
                          View comments
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Your site</p>
                      <h2 className="mt-2 text-lg font-semibold text-gray-900">
                        {activeSite?.name || "Workspace"}
                      </h2>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>

                  {activeSite?.image ? (
                    <img
                      src={activeSite.image}
                      alt={activeSite.name}
                      className="mt-4 h-36 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="mt-4 flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                      Upload a cover image to highlight this site
                    </div>
                  )}

                  {activeSite?.description && (
                    <p className="mt-4 text-sm text-gray-600">{activeSite.description}</p>
                  )}

                  {activeSiteCreatedAt && (
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-400">
                      Since {activeSiteCreatedAt}
                    </p>
                  )}

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={openCreateSite}
                      className="mt-5 w-full rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-black"
                    >
                      Create new site
                    </button>
                  )}
                </div>

                {otherSites.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Other sites</p>
                    <div className="mt-4 space-y-3">
                      {otherSites.map((site) => (
                        <div key={site.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                          <p className="text-sm font-semibold text-gray-900">{site.name}</p>
                          {site.description && <p className="text-xs text-gray-500">{site.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      );
    };

    export default Feed;
