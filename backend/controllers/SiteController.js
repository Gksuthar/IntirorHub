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
    const companyName = req.user.companyName;

    const sites = await Site.find({ companyName }).sort({ createdAt: -1 });

    const payload = sites.map(sanitizeSite);

    return res.status(200).json({ sites: payload });
  } catch (error) {
    console.error("listSites error", error);
    return res.status(500).json({ message: "Unable to fetch sites" });
  }
};

export const createSite = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admins can create sites" });
    }

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
