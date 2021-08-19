import mongoose from "mongoose";
const {
    ObjectId
} = mongoose.Schema;

const LinkSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        max: 256
    },
    url: {
        type: String,
        trim: true,
        required: true,
        max: 256
    },
    slug: {
        type: String,
        lowercase: true,
        required: true,
        index: true
    },
    postedBy: {
        type: ObjectId,
        ref: 'User'
    },
    categories: [
        {
            type: ObjectId,
            ref: 'Category',
            required: true
            }
        ],
    tags: [
        {
            type: ObjectId,
            ref: 'Tag',
            required: true
            }
        ],
    channel: [
        {
            type: ObjectId,
            ref: 'Channel',
        }
    ],
    type: {
        type: String,
        default: 'Free'
    },
    medium: {
        type: String,
        default: 'Video'
    },
    clicks: {
        type: Number,
        default: 0
    }
    linkStatus: {
        type: String,
        default: "Not Approved",
        enum: [
        "Not Approved",
        "Approved",
      ],
    },
}, {
    timestamps: true
});

const Link = mongoose.model("Link", LinkSchema);

export default Link;