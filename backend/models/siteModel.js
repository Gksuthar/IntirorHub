
import mongoose from "mongoose";

const SiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    contractValue: {
      type: Number,
      default: 0,
    },
    clientEmail: {
      type: String,
      trim: true,
    },
    clientPhone: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    expectedCompletionDate: {
      type: Date,
    },
    companyName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Site", SiteSchema);
