import Account from "../models/account.model.js"
import bcrypt from "bcrypt";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import otpGenerator from 'otp-generator';
import User from "../models/user.model.js";
import mongoose from "mongoose";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.GENERATED_APP_PASSWORD
    },
    port: 465,
    host: 'smtp.gmail.com',
    secure: true
});

export const signup = async (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(422).send({ message: "Missing required fields (email, password, name)." });
    }

    try {
        const existingAccount = await Account.findOne({ email }).exec();
        if (existingAccount) {
            return res.status(409).send({ message: "Email is already in use." });
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        const accountId = new mongoose.Types.ObjectId();

        const newUser = new User({ _id: accountId, name });
        await newUser.save();

        const newAccount = new Account({  _id: accountId, user: accountId, name: name, email: email, password: hashedPassword });
        newAccount.save().then((account) => {
            const token = jwt.sign({ id: accountId }, process.env.JWT, { expiresIn: "9999 years" });
            res.status(200).json({ token, account });
        }).catch((err) => {
            next(err);
        });
    } catch (err) {
        next(err);
    }
}

export const signin = async (req, res, next) => {
    try {
        const account = await Account.findOne({ email: req.body.email });
        if (!account) {
            return next(createError(201, "Account not found"));
        }
        if (account.googleSignIn) {
            return next(createError(201, "Entered email is Signed Up with google account. Please SignIn with google."));
        }
        const validPassword = await bcrypt.compareSync(req.body.password, account.password);
        if (!validPassword) {
            return next(createError(201, "Wrong password"));
        }

        const token = jwt.sign({ id: account._id }, process.env.JWT, { expiresIn: "9999 years" });
        res.status(200).json({ token, account });
    } catch (err) {
        next(err);
    }
}

export const googleAuthSignIn = async (req, res, next) => {
    try {
        const account = await Account.findOne({ email: req.body.email });
        if (!account) {
            try {
                const accountId = new mongoose.Types.ObjectId();
                const newAccount = new Account({
                    _id: accountId,
                    user: accountId,
                    name: req.body.name,
                    googleSignIn: true,
                    email: req.body.email,
                });
                await newAccount.save();
                
                const newUser = new User({
                    _id: accountId,
                    name: req.body.name,
                    account: accountId, // Ensure the account is properly referenced
                });
                await newUser.save();
                const token = jwt.sign({ id: newAccount._id }, process.env.JWT, { expiresIn: "9999 years" });
                
                res.status(200).json({ token, account: account });
            } catch (err) {
                console.error("Error during account creation: ", err.message);
                next(err);
            }
        } else if (account.googleSignIn) {
            const token = jwt.sign({ id: account._id }, process.env.JWT, { expiresIn: "9999 years" });
            res.status(200).json({ token, account });
        } else if (account.googleSignIn === false) {
            return next(createError(201, "Account already exists with this email can't do google auth"));
        }
    } catch (err) {
        console.error("Error during authentication process: ", err.message);
        next(err);
    }
}

export const logout = (req, res) => {
    res.clearCookie("access_token").json({ message: "Logged out" });
}

export const generateOTP = async (req, res, next) => {
    req.app.locals.OTP = await otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true, });
    const { email, name, reason } = req.query;
    if (!email || !name || !reason) { 
        return res.status(400).json({ message: "Email, name, and reason are required" }); 
    }
    const verifyOtp = {
        to: email,
        subject: 'Account Verification OTP',
        html: `
        <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
        <h1 style="font-size: 22px; font-weight: 500; color: #306EE8; text-align: center; margin-bottom: 30px;">Verify Your TASKIT Account</h1>
        <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #306EE8; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
            <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;">Verification Code</h2>
            <h1 style="font-size: 32px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 20px;">${req.app.locals.OTP}</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Dear ${name},</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Thank you for creating a TASKIT account. To activate your account, please enter the following verification code:</p>
            <p style="font-size: 20px; font-weight: 500; color: #666; text-align: center; margin-bottom: 30px; color: #306EE8;">${req.app.locals.OTP}</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Please enter this code in the TASKIT app to activate your account.</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;">If you did not create a TASKIT account, please disregard this email.</p>
        </div>
    </div>
    <br>
    <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">Best regards,<br>The TASKIT Team</p>
</div>
        `
    };

    const resetPasswordOtp = {
        to: email,
        subject: 'TASKIT Reset Password Verification',
        html: `
            <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
                <h1 style="font-size: 22px; font-weight: 500; color: #306EE8; text-align: center; margin-bottom: 30px;">Reset Your TASKIT Account Password</h1>
                <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
                    <div style="background-color: #306EE8; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
                        <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;">Verification Code</h2>
                        <h1 style="font-size: 32px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 20px;">${req.app.locals.OTP}</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Dear ${name},</p>
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">To reset your TASKIT account password, please enter the following verification code:</p>
                        <p style="font-size: 20px; font-weight: 500; color: #666; text-align: center; margin-bottom: 30px; color: #306EE8;">${req.app.locals.OTP}</p>
                        <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Please enter this code in the TASKIT app to reset your password.</p>
                        <p style="font-size: 12px; color: #666; margin-bottom: 20px;">If you did not request a password reset, please disregard this email.</p>
                    </div>
                </div>
                <br>
                <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">Best regards,<br>The TASKIT Team</p>
            </div>
        `
    };
    if (reason === "FORGOTPASSWORD") {
        transporter.sendMail(resetPasswordOtp, (err) => {
            if (err) {
                console.log(err.message);
                next(err)
            } else {
                console.log("OTP sent");
                return res.status(200).send({ message: "OTP sent" });
            }
        })
    } else {
        transporter.sendMail(verifyOtp, (err) => {
            if (err) {
                next(err)
            } else {
                return res.status(200).send({ message: "OTP sent" });
            }
        })
    }
}

export const verifyOTP = async (req, res, next) => {
    const { otp } = req.query;
    if (parseInt(otp) === parseInt(req.app.locals.OTP)) {
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        res.status(200).send({ message: "OTP verified" });
    }
    else{
        return next(createError(201, "Wrong OTP"));
    }
}

export const createResetSession = async (req, res, next) => {
    if (req.app.locals.resetSession) {
        req.app.locals.resetSession = false;
        return res.status(200).send({ message: "Access granted" });
    } else {
        return res.status(400).send({ message: "Session expired" });
    }    
}

export const findAccountByEmail = async (req, res, next) => {
    try {
        const { email } = req.query;
        if (!email) next(createError(400, "Email is required!"));
        const account = await Account.findOne({  email });
        if (account) {
            return res.status(200).send({
                message: "Account found"
            });
        } else {
            return res.status(202).send({
                message: "Account not found"
            });
        }
    } catch (err) {
        next(err);
    }
}

export const resetPassword = async (req, res, next) => {
    if (!req.app.locals.resetSession) {
        return res.status(440).send({ message: "Session expired" });
    } else{
        const email = req.body.email;
        const password = req.body.password;

        try {
            await Account.findOne({ email }).then(account => {
                if (account) {

                    if(account.googleSignIn) {
                        return res.status(202).send({message:"This account is linked to Google. No password is required."});
                    }
                    const salt = bcrypt.genSaltSync(10);
                    const hashedPassword = bcrypt.hashSync(password, salt);
                    Account.updateOne({ email: email }, { $set: { password: hashedPassword } }).then(() => {

                        req.app.locals.resetSession = false;
                        return res.status(200).send({
                            message: "Password reset successful"
                        });

                    }).catch(err => {
                        next(err);
                    });
                } else {
                    return res.status(202).send({
                        message: "Account not found"
                    });
                }
            });
        } catch (err) {
            next(err);
        }
    }
}
