import express from "express";
import { addProject, getProject, updateProject, deleteProject, getProjectMember } from "../controller/project.controller.js";
import {verifyToken} from "../middleware/verifytoken.middleware.js";

const router = express.Router();

router.post("/add", verifyToken, addProject);  //
router.get("/get/:project_id", verifyToken, getProject);  //
router.post("/update/:project_id", verifyToken, updateProject); //
router.post("/delete/:project_id", verifyToken, deleteProject); //
router.get("/getMember/:project_id", verifyToken, getProjectMember);

export default router;