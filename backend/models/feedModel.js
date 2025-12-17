import mongoose from "mongoose";

const FeedSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["update", "photo", "document", "milestone"],
      default: "update",
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Feed", FeedSchema);
