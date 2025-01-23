import Team from '../models/team.model.js';
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Member from '../models/member.model.js';
import Task from '../models/task.model.js';
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
            (member) => member.user._id.toString() === userId
        );

        if (isTeamMember) {
            return false; 
        }
    }

    return isOwner || isAuthorizedMember;
};

export const addTeam = async (req, res, next) => {
    try {
        console.log("req.body:", req.body);

        const project = await getProjectById(req.body.project_id);
        if (!project) {
            console.log("Project not found");
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
            console.log("Existing team found:", existingTeam);
            return next(createError(400, "A team with this name already exists for the project."));
        }

        console.log("Creating new team...");
        const newTeam = new Team({
            ...req.body.team,
            project: req.body.project_id,
        });

        const savedTeam = await newTeam.save();
        console.log("New team saved:", savedTeam);

        console.log("Updating project...");
        await Project.findByIdAndUpdate(
            req.body.project_id,
            {
                $push: {
                    assign_to: savedTeam._id.toString()
                },
            },
            { new: true }
        );

        console.log("Project updated successfully");
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

        console.log("getTeam team:", team);
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

        await Promise.all(
            team?.member.map(async (member) => {
                console.log("member:", member);
                if(member.task && member.task.length > 0) {
                    console.log("member.task: ", member.task);
                    await Promise.all(
                        member.task.map(async (task)=>{
                            console.log("task.: ", task);
                            if(task.assign_by.toString() === member.toString()){
                                console.log("task.toString(): ", task.toString());
                                await Task.findByIdAndUpdate(
                                    task._id.toString(),
                                    {
                                        $pull: {
                                            assign_by: member._id.toString()
                                        }
                                    },
                                    { new: true }
                                );
                            }

                            if(task.assign_to.toString() === member._id.toString()){
                                await Task.findByIdAndUpdate(
                                    task._id.toString(),
                                    {
                                        $pull: {
                                            assign_to: member._id.toString()
                                        }
                                    },
                                    { new: true }
                                );
                            }

                            await User.findByIdAndUpdate(
                                member.user._id.toString(),
                                {
                                    $pull: {
                                        task: task._id.toString(),
                                    },
                                },
                                { new: true }
                            );
                        })
                    )
                } 

                console.log("member._id.toString(): ",member._id.toString());
                await Member.findByIdAndDelete(member._id.toString());

                console.log("member.user._id.toString: ", member.user._id.toString());
                await User.findByIdAndUpdate(
                    member.user._id.toString(),
                    {
                        $pull: {
                            assign_to: req.params.team_id,
                            project: req.body.project_id,
                        },
                    },
                    { new: true }
                );
            })
        );

        await Team.findByIdAndDelete(req.params.team_id);

        await Project.findByIdAndUpdate(
            req.body.project_id,
            {
                $pull: {
                    assign_to: req.params.team_id
                }
            },
            { new: true }
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

