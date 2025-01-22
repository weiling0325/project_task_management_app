import express from "express";
import {verifyToken} from "../middleware/verifytoken.middleware.js";
import { addTeam, updateTeam, getTeam, deleteTeam } from "../controller/team.controller.js";

const router = express.Router();

router.post("/add", verifyToken, addTeam);  //
router.post("/update/:team_id", verifyToken, updateTeam); //
router.get("/get/:team_id", verifyToken, getTeam);    //
router.post("/delete/:team_id", verifyToken, deleteTeam);  //

export default router;