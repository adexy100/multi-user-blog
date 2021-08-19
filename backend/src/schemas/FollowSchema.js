import mongoose from "mongoose";
const {
    ObjectId
} = mongoose.Schema;

const TopicFollowSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    user_target: {
        type: ObjectId,
        ref: 'User',
        default: []
    },
    topic_target: {
        type: ObjectId,
        ref: 'Tag',
        default: []
    },
    channel_target: {
        type: ObjectId,
        ref: 'Channel',
        default: []
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            getters: true,
            virtuals: true
        }
    }
});

const Follow = mongoose.model('TopicFollow', FollowSchema);
export default Follow;