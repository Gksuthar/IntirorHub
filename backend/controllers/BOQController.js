import BOQItem from '../models/boqModel.js';
import Site from '../models/siteModel.js';
import User from '../models/userModel.js';
import fs from 'fs';
import path from 'path';

const REFERENCE_IMAGE_FOLDER = path.join(process.cwd(), 'uploads', 'boq-images');

// Ensure folder exists
try { fs.mkdirSync(REFERENCE_IMAGE_FOLDER, { recursive: true }); } catch (e) {}

export const addBOQItem = async (req, res) => {
  try {
    const { roomName, itemName, quantity, unit, rate, totalCost, comments, siteId, referenceImageBase64, referenceImageFilename } = req.body;

    const site = await Site.findById(siteId);
    if (!site) return res.status(404).json({ message: 'Site not found' });

    const hasAccess = site.companyName === req.user.companyName ||
                      (req.user.siteAccess && req.user.siteAccess.some(id => id.toString() === siteId));
    if (!hasAccess) return res.status(403).json({ message: 'You do not have access to this site' });

    const boqItem = new BOQItem({
      roomName,
      itemName,
      quantity: Number(quantity),
      unit,
      rate: Number(rate),
      totalCost: Number(totalCost),
      comments,
      siteId,
      createdBy: req.user._id,
      companyName: req.user.companyName
    });

    // Save reference image if provided as base64
    if (referenceImageBase64 && referenceImageFilename) {
      const buffer = Buffer.from(referenceImageBase64, 'base64');
      const safeName = `${Date.now()}-${referenceImageFilename}`.replace(/\s+/g, '_');
      const filePath = path.join(REFERENCE_IMAGE_FOLDER, safeName);
      fs.writeFileSync(filePath, buffer);
      boqItem.referenceImage = { path: `/api/boq/image/${safeName}`, filename: referenceImageFilename };
    }

    await boqItem.save();

    res.status(201).json({ message: 'BOQ item added', boqItem });
  } catch (error) {
    console.error('Error adding BOQ item', error);
    res.status(500).json({ message: 'Error adding BOQ item', error: error.message });
  }
};

export const getBOQItemsBySite = async (req, res) => {
  try {
    const { siteId } = req.params;
    const site = await Site.findById(siteId);
    if (!site) return res.status(404).json({ message: 'Site not found' });

    const hasAccess = site.companyName === req.user.companyName ||
                      (req.user.siteAccess && req.user.siteAccess.some(id => id.toString() === siteId));
    if (!hasAccess) return res.status(403).json({ message: 'You do not have access to this site' });

    const boqItems = await BOQItem.find({ siteId }).sort({ roomName: 1, createdAt: 1 });

    // Group by roomName
    const groupedItems = {};
    boqItems.forEach(item => {
      if (!groupedItems[item.roomName]) {
        groupedItems[item.roomName] = [];
      }
      groupedItems[item.roomName].push(item);
    });

    // Calculate stats
    const totalItems = boqItems.length;
    const totalCost = boqItems.reduce((sum, item) => sum + item.totalCost, 0);
    const roomCount = Object.keys(groupedItems).length;

    res.json({
      boqItems: groupedItems,
      stats: {
        totalItems,
        totalCost,
        roomCount
      }
    });
  } catch (error) {
    console.error('Error fetching BOQ items', error);
    res.status(500).json({ message: 'Error fetching BOQ items', error: error.message });
  }
};

export const getBOQImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(REFERENCE_IMAGE_FOLDER, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving BOQ image', error);
    res.status(500).json({ message: 'Error serving image' });
  }
};