import express from "express";
import { signup, signin, googleAuthSignIn, logout, generateOTP, verifyOTP, createResetSession, findAccountByEmail, resetPassword } from "../controller/auth.controller.js";
import {localVariables} from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);
router.post("/google", googleAuthSignIn);
router.get("/findbyemail", findAccountByEmail);
router.get("/generateotp",localVariables, generateOTP);
router.get("/verifyotp", verifyOTP);
router.get("/createResetSession", createResetSession);
router.post("/forgetpassword", resetPassword);

export default router;