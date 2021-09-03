import mongoose from "mongoose";
const {
    ObjectId
} = mongoose.Schema;

export enum ENotificationType {
    follow = 'follow',
    like = 'like',
    commentLike = 'comment-like',
    comment = 'comment',
    reply = 'reply'
}

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['follow', 'like', 'comment-like', 'comment', 'reply'],
    },
    initiator: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    target: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    unread: {
        type: Boolean,
        default: true
    },
    link: {
        type: String,
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
        virtuals: true,
        getters: true
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;