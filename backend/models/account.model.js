import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const accountSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String, 
        required: true
    },
    email:{
        type: String, 
        required: true,
        unique: true 
    },
    password:{
        type: String
    },
    googleSignIn:{
        type: Boolean,
        required: true,
        default: false,
    },
}, { 
    timestamps: true 
});

const Account = mongoose.model("Account",accountSchema);

export default Account;