import Site from "../models/siteModel.js";

const sanitizeSite = (siteDoc) => {
  const site = siteDoc.toObject({ getters: true });
  return {
    id: site._id,
    name: site.name,
    description: site.description,
    image: site.image,
    contractValue: site.contractValue || 0,
    createdAt: site.createdAt,
  };
};

export const listSites = async (req, res) => {
  try {
    const userId = req.user._id;
    const parentId = req.user.parentId;

    let query;
    if (req.user.role === 'ADMIN') {
      query = parentId ? { $or: [{ userId }, { userId: parentId }] } : { userId };
    } else {
      const accessIds = Array.isArray(req.user.siteAccess) ? req.user.siteAccess : [];
      if (accessIds.length === 0) {
        return res.status(200).json({ sites: [] });
      }
      query = { _id: { $in: accessIds } };
    }

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
    let { contractValue, budget } = req.body;

    const parseNumber = (v) => {
      if (v === undefined || v === null || v === '') return NaN;
      if (typeof v === 'number') return v;
      const cleaned = String(v).replace(/,/g, '').trim();
      return Number(cleaned);
    };

    const parsedContract = !isNaN(parseNumber(contractValue))
      ? parseNumber(contractValue)
      : !isNaN(parseNumber(budget))
      ? parseNumber(budget)
      : 0;

    const finalContractValue = Number.isFinite(parsedContract) ? parsedContract : 0;


    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Site name is required' });
    }

    const site = await Site.create({
      name: name.trim(),
      description: description?.trim() || undefined,
      image: image || undefined,

      contractValue: finalContractValue,

      companyName: req.user.companyName,
      createdBy: req.user._id,
      userId: req.user._id,
    });

    return res.status(201).json({
      message: 'Site created successfully',
      site: sanitizeSite(site),
    });
  } catch (error) {
    console.error('createSite error', error);
    return res.status(500).json({ message: 'Unable to create site' });
  }
};


// Admin: update contract value
export const updateContractValue = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can update contract value" });
    }
    const { siteId } = req.params;
    const { contractValue } = req.body;
    if (typeof contractValue !== "number" || contractValue < 0) {
      return res.status(400).json({ message: "Invalid contract value" });
    }
    const site = await Site.findByIdAndUpdate(siteId, { contractValue }, { new: true });
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    return res.json({ message: "Contract value updated", site: sanitizeSite(site) });
  } catch (error) {
    console.error("updateContractValue error", error);
    return res.status(500).json({ message: "Unable to update contract value" });
  }
};

export default {
  listSites,
  createSite,
};
