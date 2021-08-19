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
    content: {
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
        type: Object, // switched to cloudinary so I have to set as Object
        default: {},
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
        default: 'public',
        enum: ['public', 'private' 'follow']
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
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);