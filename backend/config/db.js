import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

 export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI).then(() => {
            console.log('MongoDB connected');
        }).catch((err) => {
            console.log(err);
        });         
    } catch (e){
        console.error("connectDB error:", e.message);
        console.error(`error : ${e.message}`);
        process.exit(1);
    }
}