import express from "express";
import { getUserByToken, deleteUser, getUser, updateUser, getUserProject, getUserTeam, getUserTask, getUserNotification, searchAccountByEmail, getSearchResult } from "../controller/user.controller.js";
import {verifyToken} from "../middleware/verifytoken.middleware.js";

const router = express.Router();

router.get("/get/:id", verifyToken, getUser);
router.get("/get", verifyToken, getUserByToken);    
router.post("/update/:id", verifyToken, updateUser);
router.post("/delete/:id", verifyToken, deleteUser);    
router.get("/getProject", verifyToken, getUserProject); 
router.get("/getTeam", verifyToken, getUserTeam);
router.get("/getTask", verifyToken, getUserTask);   
router.get("/getNotification", verifyToken, getUserNotification); 
router.get("/searchAccountByEmail/:email", verifyToken, searchAccountByEmail);  
router.get("/get/search/:search", verifyToken, getSearchResult);

export default router;