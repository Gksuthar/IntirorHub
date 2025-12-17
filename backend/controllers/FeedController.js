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
    content: item.content,
    images: item.images || [],
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

    const site = await Site.findOne({ _id: siteId, companyName: req.user.companyName });
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const items = await Feed.find({
      companyName: req.user.companyName,
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
    const { siteId, content, images } = req.body;

    if (!siteId) {
      return res.status(400).json({ message: "siteId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(siteId)) {
      return res.status(400).json({ message: "Invalid siteId" });
    }

    const site = await Site.findOne({ _id: siteId, companyName: req.user.companyName });
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }

    const trimmedContent = (content || "").trim();
    const normalizedImages = Array.isArray(images) ? images.filter(Boolean) : [];

    if (!trimmedContent && normalizedImages.length === 0) {
      return res.status(400).json({ message: "Content or images are required" });
    }

    const type = normalizedImages.length > 0 ? "photo" : "update";

    const feed = await Feed.create({
      site: site._id,
      createdBy: req.user._id,
      companyName: req.user.companyName,
      type,
      content: trimmedContent,
      images: normalizedImages,
    });

    const item = {
      id: feed._id,
      type,
      content: feed.content,
      images: feed.images || [],
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

export default {
  listFeed,
  createFeedItem,
};
