import express from "express";
import { verifyToken } from "../middleware/verifytoken.middleware.js";
import { inviteMember, verifyInvitation, getMember, updateMember, removeMember } from "../controller/member.controller.js";

const router = express.Router();

router.post("/invite/:id", verifyToken, inviteMember);   
router.get("/invite/:code", verifyInvitation);  
router.get("/get/:member_id", verifyToken, getMember);  
router.post("/update/:member_id", verifyToken, updateMember);   
router.post("/remove/:member_id", verifyToken, removeMember);   

export default router;