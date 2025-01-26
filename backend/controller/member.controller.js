import Team from "../models/team.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import Member from "../models/member.model.js";
import Task from "../models/task.model.js";
import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import { createError } from "../error.js";
import Account from "../models/account.model.js";
import mongoose from "mongoose";
import Notification from "../models/notification.model.js";

dotenv.config();

const checkMemberExist = async (member_id) => {
    const member = await Member.findById(member_id).
        populate({
            path: "user",
            populate: {
                path: "account",
                select: "name email"
            }
        });
    return member;
};

const checkAuthorization = async (project_id, team_id, user_id) => {
    const project = await Project.findById(project_id).populate({
        path: "assign_to",
        populate: {
            path: "member",
            populate: {
                path: "user",
            },
        },
    });
    if (!project) throw createError(404, "Project not found!");

    const team = await Team.findById(team_id).populate({
        path: "member",
        populate: {
            path: "user",
            select: "_id"
        }
    });
    if (!team) throw createError(404, "Team not found!");

    const isOwner = project.created_by.toString() === user_id;
    
    const isAuthorizedMember = team.member?.some(
        (member) => member.user._id.toString() === user_id && member.allow_to_modify
    );

    return isOwner || isAuthorizedMember;
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.GENERATED_APP_PASSWORD
    },
    port: 465,
    host: 'smtp.gmail.com'
});

export const inviteMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { project_id, user_id, email, allow_to_modify, member_role } = req.body;

        if (!project_id || !user_id || !email) {
            return next(createError(400, "Invalid input payload!"));
        }

        const project = await Project.findById(project_id).populate({
            path: "assign_to",
            populate: {
                path: "member",
                populate: {
                    path: "user",
                }
            },
        });;
        if (!project) {
            return next(createError(404, "Project not found!"));
        }

        const user = await Account.findById(user_id);
        if (!user) {
            return next(createError(404, "User not found!"));
        }

        const isAuthorized = await checkAuthorization(project_id, id, req.user.id);
        if (!isAuthorized) {
            return next(createError(403, "You are not allowed to invite team member to this team!"));
        }

        const team = await Team.findById(id).populate({
            path: "member",
            populate: {
                path: "user",
                populate: {
                    path: "account",
                    select: "_id name email"
                }
            },
        });

        if (!team) {
            return next(createError(404, "Team not found!"));
        }

        let memberExist = false;
        project.assign_to.forEach((team) => {
            team.member.forEach((member) => {
                if (member.user._id.toString() === user_id) {
                    memberExist = true;
                    return; 
                }
            });
        
            if (memberExist) {
                return; 
            }
        });
        
        if (memberExist) {
            return res.status(403).json({ message: "User is already a member of this project!" });
        }
        
        req.app.locals.CODE = await otpGenerator.generate(8, { upperCaseAlphabets: true, specialChars: true, lowerCaseAlphabets: true, digits: true, });
        const link = `${process.env.WEBPAGE}/member/invite/${req.app.locals.CODE}?user_id=${user_id}&team_id=${id}&member_role=${member_role}&allow_to_modify=${allow_to_modify}`;
        console.log("inviteMember link: ", link);
        const mailBody = `
            <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
            <h1 style="font-size: 22px; font-weight: 500; color: #306EE8; text-align: center; margin-bottom: 30px;">Invitation to join a TASKIT Project</h1>
            <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #306EE8; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
                    <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;"><b>${project.project_name}</b></h2>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Hi ${user.name},</p>
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">You've been invited to join team <b>${team.team_name}</b> of a project called <b>${project.project_name}</b> on TASKIT by <b>${user.name}</b>.</p>
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">To accept the invitation and join the project, please click on the button below:</p>
                    <div style="text-align: center; margin-bottom: 30px;">
                        <a href=${link} style="background-color: #306EE8; color: #FFF; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Accept Invitation</a>
                    </div>
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">If you have any questions or issues with joining the project, please contact  <b>${user.name}</b> for assistance.</p>
                </div>
            </div>
            <br>
            <p style="font-size: 16px; color: #666; margin-top: 30px;">Best regards,</p>
            <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">Best regards,<br>The TASKIT Team</p>
        </div>
        `

        const mailOptions = {
            to: req.body.email,
            subject: `Invitation to join project ${project.project_name}`,
            html: mailBody
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error("Error while sending invitation mail: ", err.message);
                return next(createError(500, "Failed to send invitation email."));
            }
            res.status(200).json({ message: "Email sent successfully" });
        });
    } catch (err) {
        console.error("Error inviting a new team member:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const verifyInvitation = async (req, res, next) => {
    try {
        const code = req.params.code;
        const { user_id, team_id, member_role, allow_to_modify } = req.query;
        if (code !== req.app.locals.CODE) {
            return next(createError(400, "Invalid or expired code!"));
        }

        req.app.locals.CODE = null;
        req.app.locals.resetSession = true;

        const newMember = new Member({ id: user_id, member_role: member_role, allow_to_modify: allow_to_modify, user: user_id });
        await newMember.save();

        const findTeam = await Team.findByIdAndUpdate(
            team_id,
            {
                $addToSet: {
                    member: newMember.id
                },
            }, 
        );

        await User.findByIdAndUpdate(
            user_id,
            {
                $addToSet: {
                    project: findTeam.project.toString(),
                    team: team_id,
                }
            }
        );
        res.status(200).json({ Message: "You have successfully joined the team!" });

    } catch (err) {
        console.error("Error verifying team member invitation:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMember = async (req, res, next) => {
    try {
        const { member_id } = req.params;
        if (!member_id) {
            return res.status(400).json({ message: "Member ID is required." });
        }
        const member = await Member.findById(member_id).
            populate({
                path: "user",
                populate: {
                    path: "account",
                    select: "name email"
                }
            });

        if (!member) {
            return next(createError(404, "Member not found!"));
        }
        res.status(200).json({ data: member });
    } catch (err) {
        console.error("Error getting team member:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateMember = async (req, res, next) => {
    try {
        const isAuthorized = await checkAuthorization(req.body.project_id, req.body.team_id, req.user.id);
        if (!isAuthorized) {
            return next(createError(403, "You are not allowed to update the team member for this team!"));
        }

        if (!checkMemberExist) {
            return next(createError(404, "Member not found!"));
        }

        const updateMember = await Member.findByIdAndUpdate(
            req.params.member_id,
            {
                $set: {
                    member_role: req.body.member_role,
                    allow_to_modify: req.body.allow_to_modify,
                },
            }, 
        );
        
        res.status(200).json({ data: updateMember });
    } catch (err) {
        console.error("Error updating team member:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const removeMember = async (req, res, next) => {
    const session = await mongoose.startSession(); 
    session.startTransaction();

    try {
        const isAuthorized = await checkAuthorization(req.body.project_id, req.body.team_id, req.user.id);
        if (!isAuthorized) {
            return next(createError(403, "You are not allowed to remove the team member from this team!"));
        }
        
        const member = await Member.findById(req.params.member_id).populate({
            path: "task",
            select: "assign_by assign_to"
        });
        if (!member) {
            return next(createError(404, "Member not found!"));
        }

        const project = await Project.findById(req.body.project_id);
        if (!project) {
            return next(createError(404, "Project not found!"));
        }

        if (member.task?.length > 0) {
            for (const task of member.task) {
                if(task.assign_by === req.body.user_id){
                    await Task.findByIdAndUpdate(task._id.toString(), {
                        $unset: { assign_by: "" },
                        $pull: {team: req.body.team_id}
                    });
                } else {
                    await Task.findByIdAndUpdate(task._id.toString(), {
                        $pull: { assign_to: req.body.user_id,
                            team: req.body.team_id
                         },
                    });
                }
                await User.findByIdAndUpdate(
                    req.body.user_id,
                    {
                        $pull: {
                            task: task._id.toString()
                        }
                    },
                );

            }
        }

        await Member.findByIdAndDelete(req.params.member_id);
        await Team.findByIdAndUpdate(
            req.body.team_id,
            {
                $pull: {
                    member: req.params.member_id,
                }
            },
        );

        const newNotification = new Notification({
            link: project.id,
            type: "Removed from team",
            message: `"You have been removed from project "${project.project_name.toUpperCase()}".`,
        });
        await newNotification.save();

        await User.findByIdAndUpdate(
            req.body.user_id,
            {
                $pull: {
                    project: req.body.project_id,
                    team: req.body.team_id,
                },
                $push :{
                    notification: newNotification
                }
            },
        );
        
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Member has been removed..." })
    } catch (err) {
        await session.abortTransaction(); 
        session.endSession();
        console.error("Error removing team member:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};