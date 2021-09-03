import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const options = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret, opt) {
      delete ret.parents;
      return ret;
    },
  },
  toObject: {
    getters: true,
    virtuals: true,
    transform: function (doc, ret, opt) {
      delete ret.parents;
      return ret;
    },
  },
};

const CommentSchema = new mongoose.Schema(
  {
    _blog_id: {
      type: ObjectId,
      ref: "Blog",
      required: true,
    },
    parent: {
      type: ObjectId,
      ref: "Comment",
      default: null,
    },
    parents: [
      {
        type: ObjectId,
        ref: "Comment",
      },
    ],
    depth: {
      type: Number,
      default: 1,
    },
    body: String,
    _author_id: {
      type: ObjectId,
      ref: "User",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    createdAt: Date,
    updatedAt: Date,
  },
  options
);

CommentSchema.virtual("author", {
  ref: "User",
  localField: "_author_id",
  foreignField: "_id",
  justOne: true,
});

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
