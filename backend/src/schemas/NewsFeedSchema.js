import mongoose from "mongoose";
const {
    ObjectId
} = mongoose.Schema;

const NewsFeedSchema = new mongoose.Schema({
    follower: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    topic_follow: {
        type: ObjectId,
        required: true,
        ref: 'Tag'
    },
    post: {
        type: ObjectId,
        required: true,
        ref: 'Blog'
    },
    post_owner: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: Date
});

const NewsFeed = mongoose.model('NewsFeed', NewsFeedSchema);
export default NewsFeed;