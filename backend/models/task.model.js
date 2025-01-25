import mongoose from 'mongoose';

const taskSchema  = new mongoose.Schema({
    team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    }],
    assign_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assign_to: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    task_title: {
        type: String,
        required: true,
        unique: false
    },
    priority: {
        type: String,
        required: true,
        enum: ["Low", "Medium", "High"]
    },
    duedate: {
        type: Date,
        required: true
    },
    task_description: {
        type: String
    },
    task_status: { 
        type: String, 
        enum: [ "Pending", "Working", "Completed", "In Review", "Approved", "Cancelled" ],
        default: "Pending" 
    },
    task_comment: {
        type: [{
            comment_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            comment_text: {
                type: String,
                required: true
            },
            comment_time: {
                type: Date,
                required:true
            }
        }],
        default: [],
    },
    task_attachment: [
        {
          filename: { type: String }, 
          url: { type: String }, 
          filetype: { type: String },
          uploadedAt: { type: Date, default: Date.now }, 
        },
      ],
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema)

export default Task;