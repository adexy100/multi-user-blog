import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const ChannelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minlength: [3, "Too short"],
      maxlength: [50, "Too long"],
    },
    content: {
      type: {},
      min: [20, "Too short"],
      max: [2000, "Too long"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    createdBy: {
      type: ObjectId,
      ref: "User",
    },
    category: {
      type: ObjectId,
      ref: "Category",
      required: true,
    },
    channelPicture: {
      type: Object, // switched to cloudinary so I have to set as Object
      default: {},
    },
    coverPhoto: {
      type: Object,
      default: {},
    },
    clicks_check: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Channel = mongoose.model("Channel", ChannelSchema);

export default Channel;
