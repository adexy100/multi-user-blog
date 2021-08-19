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
    isEdited: {
        type: Boolean,
        default: false
    },
    privacy: {
        type: String,
        default: 'public',
        enum: ['Channel', 'public']
    },
    blogReport: {
        type: String,
        enum: [
        "Inappropraite Content",
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