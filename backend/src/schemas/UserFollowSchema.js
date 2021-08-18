import mongoose from "mongoose";
const {
    ObjectId
} = mongoose.Schema;

const UserFollowSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    target: {
        type: ObjectId,
        ref: 'User',
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

const UserFollow = mongoose.model('UserFollow', UserFollowSchema);
export default UserFollow;