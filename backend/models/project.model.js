import mongoose from 'mongoose';

const projectSchema  = new mongoose.Schema({
    assign_to: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    }],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    project_name: {
        type: String,
        required: true
    },
    project_description: {
        type: String,
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    project_status: {
        type: String,
        required: true
    },
    task: [{
        type:  mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: false
    }]
}, {
    timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

export default Project;