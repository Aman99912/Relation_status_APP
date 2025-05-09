import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },               // 👈 Full Name
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    mobile: { type: String, unique: true, required: true }, // 👈 Renamed from `mobile`
    password: { type: String, required: true },
    SubPassword: { type: String },
    otp: { type: String },
    otpExpiration: { type: Date },
    code: { type: String, required: true, unique: true },
  },
  {
    collection: 'userInfo',
    timestamps: true, // Optional: adds createdAt and updatedAt
  }
);

export const UserModel = mongoose.model('UserInfo', UserSchema);
