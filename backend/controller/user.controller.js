import User from "../models/user.model.js";
import { createError } from "../error.js";
import Account from "../models/account.model.js";
import Project from "../models/project.model.js";

export const getUserByToken = async(req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access!" });
        }
        const user = await User.findById(req.user.id)
            .populate("notification")
            .populate({
                path: "project",
                select: "project_name",
            })
            .populate({
                path: "team",
                select: "team_name",
            })
            .populate("task");

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        
        res.status(200).json({ data: user });
    } catch (error){
        console.error("Error in getting user from his token: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const id = req.params.id;
        const findUser = id
            ? await User.findById(id).populate("project").populate("team").populate("task")
            : await User.find().populate("project").populate("team").populate("task");

        if (!findUser) {
            res.status(401).json({  message: "User not found!" });
        }
        res.status(200).json({ data: findUser });
    } catch (error) {
        console.error("Error in getting user: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { user_name } = req.body;

        const user = await User.findById(id);
        if (!user) return next(createError(404, "User not found!"))

        const isAccountOwner = req.user.id === id;
        if (!isAccountOwner) return next(createError(403, "You can update only your own account!"))

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { name: user_name } },
            { new: true }
        );

        res.status(200).json({ data: updatedUser });
    } catch (error) {
        console.error("Error in updating new user: ", error.message);
        res.status(500).json({ message: error.message });
    }

};

export const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) return next(createError(404, "User not found!"))

            const isAccountOwner = req.user.id === id;
        if (!isAccountOwner) return next(createError(403, "You can delete only your own account!"))

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        console.error("Error in deleting user: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getUserProject = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate("project");
        if (!user) {
            return next(createError(404, "User not found"));
        }
        
        const projects = await Promise.all(
            user.project.map(async (findProject) => {
              const project = await Project.findById(findProject._id.toString()).populate({
                path: "assign_to",
                populate: [
                  {
                    path: "member",
                    populate: {
                      path: "user",
                      select: "name",
                      populate: {
                        path: "account",
                        select: "email",
                      },
                    },
                  },
                ],
              });
              
              return project; 
            })
          );
          
        res.status(200).json({ projects });
    } catch (error) {
        console.error("Error in getting user project: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getUserTeam = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: "team",
            select:"team_name team_role",
            populate:{
                path: "project",
                select: "project_name"
            },
            populate: {
                path: "member",
                select: ""
            },
        });
        if (!user) return next(createError(404, "User not found!"))

        res.status(200).json({ data: user.team });
    } catch (error) {
        console.error("Error in getting user team: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getUserTask = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: "task",
            select: "task_title priority duedate task_description task_status task_attachment",
            populate: [{
                path: "assign_by",
                select: "name"
            }, 
            {
                path: "assign_to",
                select: "name"
            },
            {
                path: "team",
                select: "team_name"
            },
            {
                path: "project",
                select: "project_name"
            }
        ]
        });
        if (!user) return next(createError(404, "User not found"));
        
        res.status(200).json({ data: user.task });
    } catch (error) {
        console.error("Error in getting user task: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getUserNotification = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: "notification",
            select: "message link type",
            options: { sort: { createdAt: -1 } } 
        });
        if (!user) return next(createError(404, "User not found"));

        res.status(200).json({ data: user.notification });
    } catch (error) {
        console.error("Error in getting user notification: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const searchAccountByEmail = async (req, res, next) => {
    const email = req.params.email;
    const users = [];
    try {
        await Account.findOne({ email: { $regex: email, $options: "i" } }).then((account) => {
            if(account!=null)
            {
            users.push(account);
            res.status(200).json(users);
            }else{
            res.status(201).json({message:"No user found"});
            }
      }).catch((err) => {
        next(err)
      })
    } catch (err) {
      next(err);
    }
  }

  export const getSearchResult = async(req, res) => {
    try {
        console.log("req.query.q: ",req.params.search);
        const query = req.params.search;
        if (!query) {
            return res.status(400).json({ message: "Search query is required." });
          }
        console.log("req.user.id: ", req.user.id);
        const user = await User.findById(req.user.id).populate({
            path: "project",
            select: "project_name"
        }).populate({
            path: "team",
            select: "team_name"
        }).populate({
            path: "task",
            select: "task_title"
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        const projects = user?.project.filter((p) =>
            p.project_name.toLowerCase().includes(query.toLowerCase())
        );
        const teams = user?.team.filter((t) =>
            t.team_name.toLowerCase().includes(query.toLowerCase())
        );
        const tasks = user?.task.filter((t) =>
            t.task_title.toLowerCase().includes(query.toLowerCase())
        );

        res.status(200).json({data: {projects, teams, tasks}});
    } catch (err) {
        console.error("Error in retrieving search results: ", err.message);
        res.status(500).json({ message: err.message });
    }
  }