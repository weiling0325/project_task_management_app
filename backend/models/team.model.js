import mongoose from 'mongoose';

const teamSchema  = new mongoose.Schema({
    member: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        // required: true
    }],
    team_name: {
        type: String,
        required: true
    },
    team_role: {
        type: String,
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        unique: false
    },
}, {
    timestamps: true
});

const Team = mongoose.model('Team', teamSchema);

export default Team;