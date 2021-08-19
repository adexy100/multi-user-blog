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
    target: {
        type: ObjectId,
        ref: 'Tag',
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

const TopicFollow = mongoose.model('TopicFollow', TopicFollowSchema);
export default TopicFollow;