// import mongoose from 'mongoose';

// const UserSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     username: { type: String, unique: true },
//     mobile: { type: String, unique: true, required: true },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       match: [/\S+@\S+\.\S+/, 'Invalid email format'],
//     },
//     dob: { type: Date, required: true },
//     gender: { type: String, required: true },
//     password: { type: String, required: true },
//     SubPass: { type: String },
//     otp: { type: String },
//     otpExpiration: { type: Date },
//     code: { type: String, required: true, unique: true },
//     avatar: { type: String }, // Avatar field
//     friends: {
//       type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' }],
//       validate: {
//         validator: function (v) {
//           return v.length <= 1; // Sirf 1 friend allowed
//         },
//         message: 'You can only have 1 friend',
//       },
//     },
//     friendRequests: [
//       {
//         from: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' },
//         createdAt: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   {
//     collection: 'userInfo',
//     timestamps: true,
//   }
// );

// export const UserModel = mongoose.model('UserInfo', UserSchema);
import mongoose from 'mongoose';

/* ===========================
   🧑 USER SCHEMA
=========================== */
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true },
    mobile: { type: String, unique: true, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    password: { type: String, required: true },
    SubPass: { type: String },
    otp: { type: String },
    otpExpiration: { type: Date },
    code: { type: String, required: true, unique: true },
    avatar: { type: String }, // Optional avatar image

    friends: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' }],
      validate: {
        validator: function (v) {
          return v.length <= 1; // Only 1 friend allowed
        },
        message: 'You can only have 1 friend',
      },
    },
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

/* ===========================
   📓 DIARY ENTRY SCHEMA
=========================== */
const DiarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserInfo',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String, // URLs or local paths to images
        required: true,
      },
    ],
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'diaryEntries',
    timestamps: true,
  }
);

export const DiaryModel = mongoose.model('DiaryEntry', DiarySchema);
