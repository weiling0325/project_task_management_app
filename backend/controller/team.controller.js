import Team from '../models/team.model.js';
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Member from '../models/member.model.js';
import Task from '../models/task.model.js';
import Notification from '../models/notification.model.js';
import { createError } from "../error.js";
import mongoose from 'mongoose';

const getProjectById = async (projectId) => {
    return await Project.findById(projectId).populate({
        path: "assign_to",
        populate: {
            path: "member",
            populate: {
                path: "user",
                select: "_id name email",
            },
        },
    });
};

const getTeamById = async (team_id) => {
    return await Team.findById(team_id).populate({
        path: "member",
        populate: {
            path: "user"
        },
    })
};

const isUserAuthorized = async (project, team, userId) => {
    const isOwner = project.created_by.toString() === userId;
    if (isOwner) {
        return true;
    }

    const isAuthorizedMember = await Promise.all(
        project.assign_to.map(async (team) => 
            team.member.some(
                (member) =>
                    member.user._id.toString() === userId && member.allow_to_modify
            )
        )
    ).then(results => results.some(Boolean));
    let isTeamMember = false;
    if (team) {
        const isTeamMember = team.member.some(
            (member) => member.user._id.toString() === userId && member.allow_to_modify
        );

        if (!isTeamMember) {
            return false; 
        }
    }
    console.log("isUserAuthorized isOwner: ", isOwner);
    console.log(" isUserAuthorized isAuthorizedMember: ", isAuthorizedMember);

    return isOwner || isAuthorizedMember;
};

export const addTeam = async (req, res, next) => {
    try {

        const project = await getProjectById(req.body.project_id);
        if (!project) {
            return next(createError(404, "Project not found"));
        }

        const isAuthorized = await isUserAuthorized(project, null, req.user.id);
        if (!isAuthorized) {
            return next(createError(403, "You are not allowed to add a team to this project!"));
        }

        const existingTeam = await Team.findOne({
            project: req.body.project_id,
            team_name: req.body.team.team_name,
        });

        if (existingTeam) {
            return next(createError(400, "A team with this name already exists for the project."));
        }

        const newTeam = new Team({
            ...req.body.team,
            project: req.body.project_id,
        });

        const savedTeam = await newTeam.save();

        await Project.findByIdAndUpdate(
            req.body.project_id,
            {
                $push: {
                    assign_to: savedTeam._id.toString()
                },
            },
            { new: true }
        );

        res.status(200).json({ message: "Team successfully added!", data: savedTeam });
    } catch (err) {
        console.error("Error inviting a new team member:", err);
        if (err.code === 11000) {
            res.status(400).json({ message: "A team for this project already exists." });
        } else {
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

export const updateTeam = async (req, res, next) => {
    try {
        const project = await getProjectById(req.body.project_id);
        if (!project) {
            return next(createError(404, "Project not found"));
        }

        const team = await Team.findById(req.params.team_id).populate({
            path: "member",
            select: "task member_role",
            populate: {
                path: "user",
                populate: {
                    path: "account",
                    select: "_id name email",
                }
            },
        });
        if (!team) {
            return next(createError(404, "Team not found"));
        }

        const isAuthorized = await isUserAuthorized(project, team, req.user.id);
        if (!isAuthorized) {
            return next(createError(403, "You are not authorized to update the team!"));
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            req.params.team_id,
            {
                $set: {
                    team_name: req.body.team_name,
                    team_role: req.body.team_role,
                }
            },
            { new: true }
        );
        res.status(200).json({ data: updatedTeam });
    } catch (err) {
        console.error("Error updating team:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getTeam = async (req, res, next) => {
    try {
        const {team_id} = req.params;

        const team = await Team.findById(team_id)
            .populate({
                path: "member",
                select: "task member_role allow_to_modify",
                populate: {
                    path: "user",
                    populate: {
                        path: "account",
                        select: "_id name email",
                    }
                },
            })
            .populate({
                path: "project",
                select: "_id project_name project_status created_by assign_to",
            });
        
        if (!team) {
            return next(createError(404, "Team not found"));
        }

        res.status(200).json({ data: team });
    } catch (err) {
        console.error("Error getting team:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteTeam = async (req, res, next) => {
    const session = await mongoose.startSession(); 
    session.startTransaction();

    try {
        const project = await getProjectById(req.body.project_id);
        if (!project) {
            return next(createError(404, "Project not found"));
        }

        const team = await getTeamById(req.params.team_id);
        if (!team) {
            return next(createError(404, "Team not found"));
        }

        const isAuthorized = await isUserAuthorized(project, team, req.user.id);
        if (!isAuthorized) {
            return next(createError(403, "Only the authorized member can remove this team!"));
        }

        if(team.member.length > 0){
            const removeNotification = new Notification({
                link: project._id.toString(),
                type: "Removed team",
                message: `${team.team_name} is removed from project "${project.project_name.toUpperCase()}".`,
            });
            removeNotification.save();

            for (const member of team.member) {
                if (member.task?.length > 0) {
                    for (const task of member.task) {
                        if(task.assign_by === req.body.user_id){
                            await Task.findByIdAndUpdate(task._id.toString(), {
                                $unset: { assign_by: "" },
                                $pull: { team: req.params.team_id },
                            });
                        } else {
                            await Task.findByIdAndUpdate(task._id.toString(), {
                                $pull: { assign_to: req.body.user_id, team: req.params.team_id },
                            });
                        }
                    
                        await User.findByIdAndUpdate(
                            member.user._id,
                            {
                                $pull: {
                                    task: task._id.toString(),
                                }
                            },
                        );

                        await Project.findByIdAndUpdate(req.body.project_id,
                        {
                            $pull: {
                                task: task._id.toString()
                            }
                        });
                    }
                    
                }
                await User.findByIdAndUpdate(member.user._id, {
                    $pull: { project: req.body.project_id, team: req.params.team_id },
                    $push: {notification: removeNotification._id.toString()}
                });
                await Member.findByIdAndDelete(member._id);
            }
        }

        await Team.findByIdAndDelete(req.params.team_id);

        await Project.findByIdAndUpdate(
            req.body.project_id,
            {
                $pull: {
                    assign_to: req.params.team_id
                }
            },
        );

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Team has been deleted..." });
    } catch (err) {
        await session.abortTransaction(); 
        session.endSession();
        console.error("Error deleting team:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

