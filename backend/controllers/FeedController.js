import mongoose from "mongoose";
import Feed from "../models/feedModel.js";
import Site from "../models/siteModel.js";

const buildAvatarSeed = (user) => {
  if (!user) return "User";
  return encodeURIComponent(user.email || user.name || user.companyName || "User");
};

const sanitizeFeedItem = (doc) => {
  const item = doc.toObject({ getters: true });

  const createdBy = item.createdBy || {};
  const site = item.site || {};

  return {
    id: item._id,
    type: item.type,
    title: item.title || "",
    content: item.content,
    images: item.images || [],
    attachments: item.attachments || [],
    timestamp: item.createdAt,
    likes: item.likes ?? 0,
    comments: item.commentsCount ?? 0,
    siteId: site._id || site.id || site,
    siteName: site.name,
    user: {
      name: createdBy.name || createdBy.email || "User",
      role: createdBy.role || "Member",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${buildAvatarSeed(createdBy)}`,
    },
  };
};

export const listFeed = async (req, res) => {
  try {
    const { siteId } = req.query;

    if (!siteId) {
      return res.status(400).json({ message: "siteId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: "Invalid siteId" });
    }

    // Allow access to sites created by user OR their parent
    const query = req.user.parentId
      ? { _id: siteId, $or: [{ userId: req.user._id }, { userId: req.user.parentId }] }
      : { _id: siteId, userId: req.user._id };

    const site = await Site.findOne(query);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const items = await Feed.find({
      site: site._id,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role companyName")
      .populate("site", "name");

    const payload = items.map(sanitizeFeedItem);

    return res.status(200).json({ items: payload });
  } catch (error) {
    console.error("listFeed error", error);
    return res.status(500).json({ message: error.message || "Unable to fetch feed" });
  }
};

export const createFeedItem = async (req, res) => {
  try {
    const { siteId, title, content, images, attachments } = req.body;

    if (!siteId) {
      return res.status(400).json({ message: "siteId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: "Invalid siteId" });
    }

    // Allow posting to sites created by user OR their parent
    const query = req.user.parentId
      ? { _id: siteId, $or: [{ userId: req.user._id }, { userId: req.user.parentId }] }
      : { _id: siteId, userId: req.user._id };

    const site = await Site.findOne(query);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const trimmedTitle = (title || "").trim();
    const trimmedContent = (content || "").trim();
    const normalizedImages = Array.isArray(images) ? images.filter(Boolean) : [];
    const normalizedAttachments = Array.isArray(attachments) ? attachments.filter(Boolean) : [];

    if (!trimmedContent && normalizedImages.length === 0 && normalizedAttachments.length === 0) {
      return res.status(400).json({ message: "Content, images or attachments are required" });
    }

    let type = "update";
    if (normalizedImages.length > 0) {
      type = "photo";
    } else if (normalizedAttachments.length > 0) {
      type = "document";
    }

    const feed = await Feed.create({
      site: site._id,
      createdBy: req.user._id,
      companyName: req.user.companyName,
      type,
      title: trimmedTitle,
      content: trimmedContent,
      images: normalizedImages,
      attachments: normalizedAttachments,
    });

    const item = {
      id: feed._id,
      type,
      title: feed.title || "",
      content: feed.content,
      images: feed.images || [],
      attachments: feed.attachments || [],
      timestamp: feed.createdAt,
      likes: feed.likes ?? 0,
      comments: feed.commentsCount ?? 0,
      siteId: site._id,
      siteName: site.name,
      user: {
        name: req.user.name || req.user.email || "User",
        role: req.user.role || "Member",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${buildAvatarSeed(req.user)}`,
      },
    };

    return res.status(201).json({
      message: "Post created",
      item,
    });
  } catch (error) {
    console.error("createFeedItem error", error);
    return res.status(500).json({ message: error.message || "Unable to create feed item" });
  }
};

export const getFeedItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid feed id" });
    }

    const item = await Feed.findOne({ _id: id })
      .populate("createdBy", "name email role companyName")
      .populate("site", "name userId");

    if (!item || !item.site) {
      return res.status(404).json({ message: "Feed item not found" });
    }

    // Check if user owns the site or their parent owns it
    const siteUserId = item.site.userId.toString();
    const hasAccess = siteUserId === req.user._id.toString() || 
                      (req.user.parentId && siteUserId === req.user.parentId.toString());

    if (!hasAccess) {
      return res.status(404).json({ message: "Feed item not found" });
    }

    return res.status(200).json({ item: sanitizeFeedItem(item) });
  } catch (error) {
    console.error("getFeedItem error", error);
    return res.status(500).json({ message: error.message || "Unable to fetch feed item" });
  }
};

export default {
  listFeed,
  createFeedItem,
  getFeedItem,
};
