import mongoose from "mongoose";
const {
    ObjectId
} = mongoose.Schema;

const ChannelFollowSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    target: {
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

const ChannelFollow = mongoose.model('UserFollow', ChannelFollowSchema);
export default ChannelFollow;