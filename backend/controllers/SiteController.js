import Site from "../models/siteModel.js";

const sanitizeSite = (siteDoc) => {
  const site = siteDoc.toObject({ getters: true });
  return {
    id: site._id,
    name: site.name,
    description: site.description,
    image: site.image,
    createdAt: site.createdAt,
  };
};

export const listSites = async (req, res) => {
  try {
    const userId = req.user._id;
    const parentId = req.user.parentId;

    // Find sites created by user OR their parent (if they have one)
    const query = parentId 
      ? { $or: [{ userId }, { userId: parentId }] }
      : { userId };

    const sites = await Site.find(query).sort({ createdAt: -1 });

    const payload = sites.map(sanitizeSite);

    return res.status(200).json({ sites: payload });
  } catch (error) {
    console.error("listSites error", error);
    return res.status(500).json({ message: "Unable to fetch sites" });
  }
};

export const createSite = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Site name is required" });
    }

    const site = await Site.create({
      name: name.trim(),
      description: description?.trim() || undefined,
      image: image || undefined,
      companyName: req.user.companyName,
      createdBy: req.user._id,
      userId: req.user._id,
    });

    return res.status(201).json({
      message: "Site created successfully",
      site: sanitizeSite(site),
    });
  } catch (error) {
    console.error("createSite error", error);
    return res.status(500).json({ message: "Unable to create site" });
  }
};

export default {
  listSites,
  createSite,
};
