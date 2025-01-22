import mongoose from 'mongoose';

//user id same as account id
const userSchema  = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    project: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        unique: false
    }],
    task: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        unique: false
    }],
    notification: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
        unique: false
    }],
    team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        unique: false
    }],
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        unique: true, 
        required:true
    }

},{
    timestamps: true
});

const User = mongoose.model('User', userSchema)

export default User;