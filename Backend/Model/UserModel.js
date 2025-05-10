import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, index: true },

    mobile: { type: String, unique: true, required: true, index: true },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    password: { type: String, required: true },
    SubPassword: { type: String },
    otp: { type: String },
    otpExpiration: { type: Date },
    code: { type: String, required: true, unique: true },
  },
  {
    collection: "userInfo",
    timestamps: true, // Optional: adds createdAt and updatedAt
  }
);

export const UserModel = mongoose.model("UserInfo", UserSchema);
