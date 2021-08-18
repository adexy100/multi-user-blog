import mongoose from 'mongoose';
const {
    ObjectId
} = mongoose.Schema;

const BookmarkSchema = new mongoose.Schema({
    _post_id: {
        type: ObjectId,
        ref: 'Blog',
        required: true
    },
    _author_id: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }

}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        getters: true,
        virtuals: true
    }
});

BookmarkSchema.virtual('blog', {
    ref: 'Blog',
    localField: '_post_id',
    foreignField: '_id',
    justOne: true
});

const Bookmark = mongoose.model("Bookmark", BookmarkSchema)
export default Bookmark;