import express from "express";
import { assignTask, getTask, getProjectTask, getTeamMemberTask, updateTask, deleteTask, addTaskComment, getTaskComment } from "../controller/task.controller.js";
import { verifyToken } from "../middleware/verifytoken.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post("/assign", upload.array("task_attachments"), verifyToken, assignTask);
router.get("/get/:task_id", verifyToken, getTask);
router.get("/getProject/:project_id", verifyToken, getProjectTask);
router.get("/getTeamMemberTask/:team_id", verifyToken, getTeamMemberTask);
router.post("/update/:task_id", upload.array("task_attachments"), verifyToken, updateTask);
router.post("/delete/:task_id", verifyToken, deleteTask);
router.post("/addComment/:task_id", verifyToken, addTaskComment);
router.get("/getComment/:task_id", verifyToken, getTaskComment);

export default router;