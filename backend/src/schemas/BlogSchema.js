import mongoose from 'mongoose';
const {
    ObjectId
} = mongoose.Schema;

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        min: 3,
        max: 160,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    body: {
        type: {},
        required: true,
        min: 200,
        max: 2000000
    },
    excerpt: {
        type: String,
        max: 1000
    },
    mtitle: {
        type: String
    },
    mdesc: {
        type: String
    },
    photo: {
        url: String,
        key: String
        required: true
    },
    categories: [{
        type: ObjectId,
        ref: 'Category',
        required: true
    }],
    tags: [{
        type: ObjectId,
        ref: 'Tag',
        required: true
    }],
    channel: [{
        type: ObjectId,
        ref: 'Channel'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    privacy: {
        type: String,
        default: 'Publish',
        enum: ['Publish', 'Draft' 'Follower']
    },
    blogReport: {
        type: String,
        enum: [
        "Inappropraite content",
        "Copywrite issues",
        "Irrelevant",
        "Abusive",
        "Not interested",
      ],
    },
    postedBy: {
        type: ObjectId,
        ref: 'User'
        required: true
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { getters: true, virtuals: true } });

BlogSchema.virtual('author', {
    ref: 'User',
    localField: 'postedBy',
    foreignField: '_id',
    justOne: true
});

BlogSchema.methods.isPostLiked = function (this, userID) {
    if (!isValidObjectId(userID)) return;

    return this.likes.some(user => {
        return user._id.toString() === userID.toString();
    });
}

const Blog = mongoose.model('Blog', BlogSchema);
export default Blog;