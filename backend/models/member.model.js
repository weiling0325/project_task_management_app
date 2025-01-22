import mongoose from 'mongoose';

const memberSchema  = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: false
    },
    member_role: {
        type: String,
        require: true,
        unique: false
    },
    allow_to_modify: {
        type: Boolean,
        require: true,
        default: false,
        unique: false,
    },
    task: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: false
    }]
}, {
    timestamps: true
});

const Member = mongoose.model('Member', memberSchema)

export default Member;