import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const NewsFeedSchema = new mongoose.Schema({
  follower: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  channel: {
    type: ObjectId,
    required: true,
    ref: "Channel",
  },
  post: {
    type: ObjectId,
    required: true,
    ref: "Post",
  },
  post_owner: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  createdAt: Date,
});

const NewsFeed = mongoose.model("NewsFeed", NewsFeedSchema);
export default NewsFeed;
