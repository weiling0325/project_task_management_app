import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: {
      type: String,
      required: true,
  },
  link: {
      type: String,
  },
  type: { type: String, required: true },
  },
  { 
    timestamps: true 
  });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;