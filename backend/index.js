import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import projectRoute from './routes/project.route.js';
import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import teamRoute from './routes/team.route.js';
import memberRoute from './routes/member.route.js';
import taskRoute from './routes/task.route.js';
import path from "path";
import cors from 'cors';
import morgan from 'morgan';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares 
app.use(express.json());
const corsConfig = {
    credentials: true,
    origin: true,
};
app.use(cors(corsConfig));
app.use(morgan('tiny'));
app.disable('x-powered-by');


app.use(express.json())
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/project", projectRoute);
app.use("/api/team", teamRoute);
app.use("/api/member", memberRoute);
app.use("/api/task", taskRoute);


app.listen(PORT, () => {
    console.log("conneting to db")
    connectDB();
    console.log("Server started at http://localhost:"  + PORT);
});


app.use((err, req, res, next)=>{
    const status = err.status || 500;
    const message = err.message || "Something went wrong";        
    return res.status(status).json({
        success: false,
        status,
        message
    })
})


