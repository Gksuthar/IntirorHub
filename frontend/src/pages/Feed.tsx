type FilterKey = "all" | "updates" | "photos" | "documents" | "milestones";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Download,
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
  title?: string;
  content: string;
  images?: string[];
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size?: number;
  }>;
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
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState("");
  const [newPost, setNewPost] = useState("");
  const [selectedImages, setSelectedImages] = useState<Array<{ id: string; src: string; name: string }>>([]);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ id: string; file: File }>>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(initialFeedItems);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteError, setSiteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  const avatarSeed = encodeURIComponent(user?.email || user?.name || "You");
  const isAdmin = user?.role === "ADMIN";
  const activeSiteId = activeSite?.id ?? null;
  const isPostDisabled = (!newTitle.trim() && !newPost.trim() && selectedImages.length === 0 && selectedFiles.length === 0) || isSubmitting;

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const chosenFiles = Array.from(files);
    setSelectedFiles((prev) => [
      ...prev,
      ...chosenFiles.map((file) => ({ id: generateId(), file })),
    ]);

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitPost = async () => {
    const title = newTitle.trim();
    const content = newPost.trim();
    setSiteError(null);
    if (!title && !content && selectedImages.length === 0 && selectedFiles.length === 0) {
      return;
    }
    if (!activeSiteId) {
      setSiteError("Please select a site before posting a feed.");
      return;
    }
    if (!token) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Convert files to base64
      const attachments = await Promise.all(
        selectedFiles.map(async ({ file }) => ({
          url: await fileToBase64(file),
          name: file.name,
          type: file.type,
          size: file.size,
        }))
      );

      const response = await feedApi.createFeed(
        {
          siteId: activeSiteId,
          title,
          content,
          images: selectedImages.map((image) => image.src),
          attachments,
        },
        token
      );
      const created = response.item;
      const newItem: FeedItem = {
        id: created.id,
        user: created.user,
        type: created.type,
        title: created.title,
        content: created.content,
        images: created.images,
        attachments: created.attachments,
        timestamp: created.timestamp,
        likes: created.likes,
        comments: created.comments,
        siteName: created.siteName,
      };
      setFeedItems((prev) => [newItem, ...prev]);
      setNewTitle("");
      setNewPost("");
      setSelectedImages([]);
      setSelectedFiles([]);
      setActiveFilter("all");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = "";
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
          title: item.title,
          content: item.content,
          images: item.images,
          attachments: item.attachments,
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
<div className="flex items-center justify-center bg-white px-2 pb-20 pt-16 sm:px-4 md:px-6 md:pb-10 md:pt-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-3 flex flex-col gap-1 sm:mb-8 sm:gap-2">
              <h1 className="text-lg font-bold text-gray-900 sm:text-2xl md:text-3xl">Feed</h1>
              <p className="text-xs text-gray-600 sm:text-sm">Stay updated with project activities and updates</p>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,2fr),minmax(280px,1fr)]">
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
                  {siteError && (
                    <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                      {siteError}
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                      alt="User avatar"
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(event) => setNewTitle(event.target.value)}
                        placeholder="Add a title (optional)"
                        className="w-full mb-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 sm:rounded-xl sm:px-4"
                      />
                      <textarea
                        value={newPost}
                        onChange={(event) => setNewPost(event.target.value)}
                        placeholder="Share an update..."
                        className="h-24 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 sm:h-28 sm:rounded-xl sm:px-4 sm:py-3"
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

                      {selectedFiles.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedFiles.map(({ id, file }) => (
                            <div
                              key={id}
                              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                            >
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-xs text-gray-700 max-w-[120px] truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(id)}
                                className="text-gray-400 hover:text-red-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex flex-col items-stretch gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 overflow-x-auto">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <input
                            ref={attachmentInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,video/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
                          >
                            <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Add photos</span>
                            <span className="xs:hidden">Photos</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => attachmentInputRef.current?.click()}
                            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
                          >
                            <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Attach files</span>
                            <span className="xs:hidden">Files</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900 sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
                          >
                            <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Attach file</span>
                            <span className="xs:hidden">File</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleSubmitPost}
                          disabled={isPostDisabled}
                          className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/40 sm:rounded-xl sm:text-sm sm:tracking-[0.3em]"
                        >
                          <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {filters.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
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
                    <div key={item.id} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <img
                            src={item.user.avatar}
                            alt={item.user.name}
                            className="h-10 w-10 flex-shrink-0 rounded-full"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 truncate">{item.user.name}</span>
                              {getTypeIcon(item.type)}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                              <span className="truncate">{item.user.role}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {item.timestamp}
                              </span>
                            </div>
                            {item.siteName && (
                              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 max-w-full">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{item.siteName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 flex-shrink-0">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>

                      {item.title && (
                        <div className="mt-3">
                          <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                        </div>
                      )}

                      <div className="mt-3">
                        <p className="text-sm text-gray-800 break-all whitespace-pre-wrap">
                          {item.content.length > 200
                            ? `${item.content.slice(0, 200)}...`
                            : item.content}
                        </p>
                        {item.content.length > 200 && (
                          <button
                            onClick={() => navigate(`/feed/${item.id}`)}
                            className="mt-2 text-sm font-medium text-gray-900 hover:underline"
                          >
                            Read more
                          </button>
                        )}
                      </div>

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

                      {item.attachments && item.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {item.attachments.map((attachment, index) => (
                            <a
                              key={`${item.id}-attachment-${index}`}
                              href={attachment.url}
                              download={attachment.name}
                              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors"
                            >
                              <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                                {attachment.size && (
                                  <p className="text-xs text-gray-500">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                              </div>
                              <Download className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </a>
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
