import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const LikeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Post", "Comment", "Link"],
    },
    target: {
      type: ObjectId,
      refPath: "type",
      required: true,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      getters: true,
      virtuals: true,
    },
  }
);

const Like = mongoose.model("Like", LikeSchema);

export default Like;
