import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: String,
    SubPassword: String,
  },
  {
    collection: 'userInfo',
  }
);

export const UserModel = mongoose.model('UserInfo', UserSchema);
