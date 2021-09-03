const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minlength: [4, "Too short"],
      maxlength: [32, "Too long"],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },
    content: {
      type: {},
      min: [20, "Too short"],
      max: [2000000, "Too long"],
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
