import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const TopicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minlength: [2, "Too short"],
      maxlength: [50, "Too long"],
    },
    content: {
      type: {},
      min: [20, "Too short"],
      max: [20000, "Too long"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    parent: {
      type: ObjectId,
      ref: "Category",
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

const Topic = mongoose.model("Topic", TopicSchema);

export default Topic;
