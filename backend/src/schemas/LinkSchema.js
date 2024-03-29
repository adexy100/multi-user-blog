import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const LinkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      max: 256,
    },
    image: {
      type: Object,
      default: {},
    },
    url: {
      type: String,
      trim: true,
      required: true,
      max: 256,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
      index: true,
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    categories: [
      {
        type: ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    tags: [
      {
        type: ObjectId,
        ref: "Tag",
        required: true,
      },
    ],
    channel: [
      {
        type: ObjectId,
        ref: "Channel",
      },
    ],
    type: {
      type: String,
      default: "Free",
      enum: ["Free", "Paid"],
    },
    medium: {
      type: String,
      default: "Video",
      enum: ['Video', 'Ebook', 'Article'],
    },
    clicks: {
      type: Number,
      default: 0,
    },
    linkStatus: {
      type: String,
      default: "Not Approved",
      enum: ["Not Approved", "Approved"],
    },
  },
  {
    timestamps: true,
  }
);

const Link = mongoose.model("Link", LinkSchema);

export default Link;
