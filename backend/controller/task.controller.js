import Task from "../models/task.model.js";
import Team from "../models/team.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Member from "../models/member.model.js";
import Notification from "../models/notification.model.js";
import { createError } from "../error.js";
import mongoose from "mongoose";

export const assignTask = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const taskDetails = JSON.parse(req.body.task);

        const files = req.files;
        const task_attachment = files.map((file) => ({
            filename: file.originalname,
            url: `/uploads/tasks/${file.filename}`,
            filetype: file.mimetype,
        }));

        const project = await Project.findById(taskDetails.project_id).populate({
            path: "assign_to",
            populate: {
                path: "member",
                populate: {
                    path: "user",
                }
            },
        });
        if (!project) return next(createError(404, "Project not found!"));

        const createdTaskUser = await User.findById(req.user.id).populate("account");

        const involvedTeam = [];
        let isAuthorizedMember = false;

        if (taskDetails.user_id.length > 0) {
            for (const user of taskDetails.user_id) {
                if(user === req.user.id) {
                    return next(createError(403, "You cannot assign a task to yourself!"));
                } 
                const findUser = await User.findById(user);
                if (!findUser) return next(createError(404, "User not found!"));

                const taskCreator = await User.findById(req.user.id);
                if (!taskCreator) return next(createError(404, "Task creator not found!"));

                await Promise.all(
                    project.assign_to.map(async (team) => {
                        const isModifier = team.member.find(
                            (member) =>
                                member.user._id.toString() === req.user.id 
                        );
                        if (isModifier) isAuthorizedMember = true;

                        const matchingMember = team.member.find(
                            (member) => member.user._id.toString() === user || member.user._id.toString() === req.user.id
                        );

                        if (matchingMember || isModifier) {
                            involvedTeam.push(team._id.toString());
                        }
                    })
                );
            }
        }

        const isOwner = project.created_by.toString() === req.user.id;
        if (!isOwner && !isAuthorizedMember) {
            return next(createError(403, "Not authorized to add tasks to this project"));
        }

        const newTaskData = new Task({
            assign_by: req.user.id,
            assign_to: taskDetails.user_id,
            project: taskDetails.project_id,
            task_title: taskDetails.task_title,
            priority: taskDetails.priority,
            duedate: taskDetails.duedate,
            task_description: taskDetails.task_description,
            task_status: taskDetails.task_status,
            task_attachment: task_attachment,
        });

        if (involvedTeam.length > 0) {
            newTaskData.team = involvedTeam;
        }
        const newTask = new Task(newTaskData);
        await newTask.save();

        await Project.findByIdAndUpdate(taskDetails.project_id,
            {
                $push: { task: newTask._id.toString() }
            },
        );

        const newNotification = new Notification({
            link: project.id,
            type: "Task Invitation",
            message: `${createdTaskUser.account.name} assigned you to task "${newTask.task_title}"  in project "${project.project_name.toUpperCase()}".`,
        });
        await newNotification.save();

        const findMember = await Member.findOne({user:taskDetails.user_id});
        await Member.findByIdAndUpdate(findMember._id.toString(),
            {
                $push: { task: newTask._id.toString() }
            }, 
        );

        const taskCreator = await Member.findOne({user:req.user.id});
        if(taskCreator) {
            await Member.findByIdAndUpdate(taskCreator._id.toString(),
            {
                $push: { task: newTask._id.toString() }
            }, 
        );
        }
        
        await User.findByIdAndUpdate(req.user.id,
            {
                $push:
                {
                    task: newTask.id,
                    notification: newNotification.id
                }
            },
        );


        if (taskDetails.user_id.length > 0) {
            for (const user of taskDetails.user_id) {
                await User.findByIdAndUpdate(user,
                    {
                        $push:
                        {
                            task: newTask.id,
                            notification: newNotification.id
                        }
                    }, 
                );
            }
        }

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: "You successfully assign a task to other!" });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error assigning task:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getTask = async (req, res, next) => {
    try {
        const task_id = req.params.task_id;

        const task = await Task.findById(task_id).populate({
            path: "project",
            select: "project_name"
        }).populate({
            path: "team",
            select: "team_name team_role"
        }).populate({
            path: "assign_by",
            select: "name",
        }).populate({
            path: "assign_to",
            select: "name",
        });
        if (!task) {
            return next(createError(404, "Task not found!"));
        }

        res.status(200).json({ data: task });
    } catch (err) {
        console.error("Error getting the task: ", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getProjectTask = async (req, res, next) => {
    try {
        const project_id = req.params.project_id;
        if (!project_id) return next(createError(400, "Project ID is required!"));
        const project = await Project.findById(project_id);
        if (!project) return next(createError(404, "Project not found!"));
        const findTask = await Task.find({ project: project_id })
            .populate({
                path: "team",
                select: "team_name",

            })
            .populate({
                path: "assign_to",
                select: "name",

            })
            .populate({
                path: "assign_by",
                select: "name",
            })
            .sort({ createdAt: -1 });
        
        res.status(200).json({ message: "Here are the assigned tasks of this project!", data: findTask });
    } catch (err) {
        console.error("Error getting the task for this project:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getTeamMemberTask = async (req, res, next) => {
    try {
        const team_id = req.params.team_id;
        const team = await Team.findById(team_id);
        if (!team) return next(createError(404, "Team not found!"));
        const findTask = await Task.find({ team: team_id })
            .populate({
                path: "team",
                select: "team_name",

            })
            .populate({
                path: "assign_to",
                select: "name",

            })
            .populate({
                path: "assign_by",
                select: "name",
            })
            .sort({ createdAt: -1 });

        
        res.status(200).json({ data: findTask });
    } catch (err) {
        console.error("Error getting the task for this team:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.task_id)
            .populate("project", "created_by");
        if (!task) return next(createError(404, "This task is not found!"));

        const taskDetails = JSON.parse(req.body.task);

        const project = await Project.findById(taskDetails.project_id).populate({
            path: "assign_to",
            populate: {
                path: "member",
                populate: {
                    path: "user",
                }
            },
        });
        if (!project) return next(createError(404, "Project not found!"));

        const files = req.files;
        const task_attachment = files.map((file) => ({
            filename: file.originalname,
            url: `/uploads/tasks/${file.filename}`,
            filetype: file.mimetype,
        }));
        
        let isAuthorizedMember = false;
        project.assign_to.map(async (team) => {
            const isModifier = team.member.find(
                (member) =>
                    member.user._id.toString() === req.user.id 
            );
            if (isModifier) isAuthorizedMember = true;
        });
        const isOwner = task.project.created_by.toString() === req.user.id;
        if (!isOwner && !isAuthorizedMember) return next(createError(403, "You are not allow to update this task!"));

        const currentAssignees = new Set(task.assign_to.map(user => user._id.toString()));
        const newAssignees = new Set(taskDetails.user_id);

        const removedAssignees = [...currentAssignees].filter(id => !newAssignees.has(id));
        const addedAssignees = [...newAssignees].filter(id => !currentAssignees.has(id));

        const assignToModified = removedAssignees.length > 0 || addedAssignees.length > 0;

        let involvedTeam = [];
        const taskCreator = task.assign_by;
        if (assignToModified) {
            project.assign_to.map(async (team) => {
                team.member.map(async (member) => {
                    if (newAssignees.has(member.user._id.toString()) || member.user._id.toString() === taskCreator) {
                        involvedTeam.push(team._id.toString());
                    }
                });
            });

            [...removedAssignees].map(async (id) => {
            const removeNotification = new Notification({
                link: task.project._id.toString(),
                type: "Removed from task",
                message: `${req.user.name} removed you from task "${task.task_title}".`,
            });
            removeNotification.save();

            User.findByIdAndUpdate(id, {
                $pull: { task: task._id.toString() },
                $push: { notification: removeNotification._id.toString() },
            });
            });

            [...newAssignees].map(async (id) => {
                if(id === task.assign_by.toString()) {
                    return next(createError(403, "You cannot assign the task to task creator!"));
                }

                const addNotification = new Notification({
                    link: task.project._id.toString(),
                    type: "Task Invitation",
                    message: `${req.user.name} assigned you to task "${taskDetails.task_title}".`,
                });
                addNotification.save();

                User.findByIdAndUpdate(id, {
                    $addToSet: { task: task._id.toString() },
                    $push: { notification: addNotification._id.toString() },
                });
            });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.task_id,
            {
                $set: {
                    assign_to: taskDetails.user_id,
                    task_title: taskDetails.task_title,
                    priority: taskDetails.priority,
                    duedate: taskDetails.duedate,
                    task_description: taskDetails.task_description,
                    task_status: taskDetails.task_status,
                    task_attachment,
                    ...(assignToModified && { team: involvedTeam }),
                },
            },
        );

        if(involvedTeam.length > 0) {
            await Task.findByIdAndUpdate(req.params.task_id,
                {
                    $set:{
                        team: involvedTeam
                    }
                }
            );
        }

        const requestor = await User.findById(req.user.id).populate({
            path: "account",
            select: "name email"
        });

        const modifyNotification = new Notification({
            link: task.project._id.toString(),
            type: "Task Updated",
            message: `${requestor.name} updated task "${task.task_title}".`,
        });
        modifyNotification.save();

        await User.findByIdAndUpdate(updatedTask.assign_by._id.toString(),
            { 
                $push: { notification: modifyNotification._id.toString()} 
            }
        );
        
        for (const user of updatedTask.assign_to) {
            await User.findByIdAndUpdate(user._id.toString(),
            { 
                $push: {notification: modifyNotification._id.toString() }
            });
        }

        res.status(200).json({ data: updatedTask });
    } catch (err) {
        console.error("Error updating the task:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const deleteTask = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const task = await Task.findById(req.params.task_id)
            .populate("project", "created_by");
        if (!task) return next(createError(404, "This task is not found!"));

        const isAuthorized = task.project.created_by.toString() === req.user.id ||
            task.assign_by.toString() === req.user.id;
        if (!isAuthorized) return next(createError(403, "Only the project owner or task creator can delete this task!"));

        await Promise.all([
            Task.findByIdAndDelete(req.params.task_id),
            Project.findByIdAndUpdate(task.project._id.toString(), { $pull: { task: task._id.toString() } }),
            Member.findByIdAndUpdate(task.team, { $pull: { task: task._id.toString() } }),
        ]);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "This task has been deleted..." });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error deleting the task:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const addTaskComment = async (req, res, next) => {
    try {
        const task_id = req.params.task_id;
        const task = await Task.findById(task_id);
        if (!task) return next(createError(404, "This task is not found!"));

        const newComment = { comment_by: req.user.id, comment_text: req.body.comment, comment_time: new Date() };
        const addCommentToTask = await Task.findByIdAndUpdate(
            task_id,
            {
                $push: {
                    task_comment: newComment
                }
            }, 
        );

        res.status(200).json({ message: "The task comment has been added..." })
    } catch (err) {
        console.error("Error adding task comment:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getTaskComment = async (req, res, next) => {
    try {
        const task_id = req.params.task_id;
        const task = await Task.findById(task_id).populate({
            path: "task_comment",
            populate: {
                path: "comment_by",
                select: "name"
            }
        });
        if (!task) {
            return next(createError(404, "This task is not found!"));
        }

        const sortedComments = task.task_comment.sort(
            (a, b) => new Date(b.comment_time) - new Date(a.comment_time)
        );
        
        res.status(200).json({ data: sortedComments });
    } catch (err) {
        console.error("Error getting task comment:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}