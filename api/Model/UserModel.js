import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    mobile: { type: String, unique: true, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    pass: { type: String, required: true },
    password: { type: String, required: true },
    SubPassword: { type: String },
    otp: { type: String },
    otpExpiration: { type: Date },
    code: { type: String, required: true, unique: true },
    avatar: { type: String }, // ✅ Avatar field added here
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' }],
    friendRequests: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    collection: 'userInfo',
    timestamps: true,
  }
);

export const UserModel = mongoose.model('UserInfo', UserSchema);
