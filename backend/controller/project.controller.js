import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Member from "../models/member.model.js";
import mongoose from "mongoose";

export const addProject = async (req, res) => {
    const session = await mongoose.startSession(); 
    session.startTransaction();

    try {
        console.log("addProject api");
        console.log("req.user", req.user.id);

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("req.body", req.body.project);

        const newProject = new Project({
            ...req.body.project,
            created_by: req.user.id,
        });
        const savedProject = await newProject.save();

        const newMember = new Member({
            user: req.user.id,
            member_role: "owner",
            allow_to_modify: true
        });
        await newMember.save();

        const updatedProject = await Project.findByIdAndUpdate(
            savedProject._id.toString(),
            { created_by: req.user.id },
            { new: true }
        );

        console.log("user.id", user.id);
        console.log("savedProject._id", savedProject._id.toString());

        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { project: savedProject._id.toString() } }
        );

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ data: updatedProject });
    } catch (error) {
        await session.abortTransaction(); 
        session.endSession();
        console.error("Error in adding project:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

const findProjectById = async (projectId) => {
    return await Project.findById(projectId)
        .populate([
            {
                path: "assign_to",
                populate: {
                    path: "member",
                    populate: {
                        path: "user",
                        populate: {
                            path: "account",
                            select: "_id name email",
                        },
                    },
                },
            },
            {
                path: "created_by",
                populate : {
                    path: "account",
                    select: "_id name email",
            },
        }
        ]);
};

export const getProject = async (req, res) => {
    try {
        console.log("getProject api");
        const project_id = req.params.project_id;
        console.log("project_id: ", project_id);
        if (!project_id) {
            return res.status(400).json({ message: "Project ID is required!" });
        }
        const project = await findProjectById(project_id);
       if (!project) {
            return res.status(404).json({ message: "Project not found!" });
        }
        console.log("getProject project: ", project);

        let isAuthorizedMember = false;
        await Promise.all(
            project.assign_to.map(async (team) => {
                const isModifier = team.member.find(
                    (member) =>
                        member.user._id.toString() === req.user.id 
                );
                if (isModifier) isAuthorizedMember = true;

            })
        );

        const isOwner = project.created_by._id.toString() === req.user.id;
        if (!isOwner && !isAuthorizedMember) {
            console.log("You are not allowed to view this project!");
            return res.status(403).json({ message: "You are not allowed to view this project!" });
        }

        console.log("project: ", project);
        res.status(200).json({ data: project });
    } catch (err) {
        console.error("Error fetching project:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProject = async (req, res) => {
    try {
        const project_id = req.params.project_id;
        const { ...updateData } = req.body;
        const project = await findProjectById(project_id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        const isOwner = project.created_by._id.toString() === req.user.id;
        let isAuthorizedMember = false;
        await Promise.all(
            project.assign_to.map(async (team) => {
                const isModifier = team.member.find(
                    (member) =>
                        member.user._id.toString() === req.user.id && member.allow_to_modify
                );
                if (isModifier) isAuthorizedMember = true;

            })
        );

        if (!isOwner && !isAuthorizedMember) {
            return res.status(403).json({ message: "You are not allowed to update this project!" });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            project_id,
            { $set: updateData },
            { new: true }
        );
        res.status(200).json({ message: "Project has been updated", data: updatedProject });
    } catch (err) {
        console.error("Error updating project:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteProject = async (req, res) => {
    const session = await mongoose.startSession(); 
    session.startTransaction();

    try {
        console.log("deleteProject api req.params.project_id", req.params.project_id);
        const id = req.params.project_id;
        const project = await findProjectById(id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const isOwner = project.created_by._id.toString() === req.user.id;
        if (!isOwner) {
            return res.status(403).json({ message: "Only project owner is allowed to delete this project!" });
        }

        await Project.findByIdAndDelete(id);


        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Project has been deleted..." });
    } catch (err) {
        await session.abortTransaction(); 
        session.endSession();
        console.error("Error deleting project:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getProjectMember= async (req, res) => {
    try {
        console.log("getProjectMember api");
        const member_list = [];
        const project = await Project.findById(req.params.project_id)
        .populate([
            {
                path: "assign_to",
                populate: {
                    path: "member",
                    select: "_id",
                    populate: {
                        path: "user",
                        populate: {
                            path: "account",
                            select: "_id name email",
                        },
                    },
                },
            },
            {
                path: "created_by",
                populate : {
                    path: "account",
                    select: "_id name email",
            },
        }
        ]);

        if(!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        let isOwnerAdded = false;
        await Promise.all(
            project.assign_to.map(async (team) => {
                if (team.member.length > 0) {
                    await Promise.all(
                        team.member.map(async (member) => {
                            member_list.push(member.user);
                            if(member.user._id.toString() === project.created_by._id.toString()) {
                                isOwnerAdded = true;
                            }
                        })
                    );
                }
            })
        );

        if(!isOwnerAdded) {
            member_list.push(project.created_by);
        }

        console.log("new member_list: ", member_list);
        res.status(200).json({ data: member_list });
    } catch (err) {
        console.error("Error getting project member:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

