import jwt from "jsonwebtoken";
import { createError } from "../error.js";

export const verifyToken = async (req, res, next) => {
    try {
        console.log("verifyToken..,");
        if (!req.headers.authorization) return next(createError(401, "You are not authenticated!"));
        const token = req.headers.authorization.split(" ")[1];
        if (!token) return next(createError(401, "You are not authenticated!"));
        const decode = await jwt.verify(token, process.env.JWT);
        req.user = decode;
        next();
    } catch (error) {
        console.log("verifyToken error", error)
        res.status(402).json({ error: error.message })
    }
};