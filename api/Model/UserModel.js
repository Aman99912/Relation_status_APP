
import mongoose from 'mongoose';


  //  USER SCHEMA





const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, trim: true },
    mobile: { type: String, unique: true, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Invalid email format'],
    },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    password: { type: String, required: true },
    SubPass: { type: String },
    bio: { type: String },
    age: { type: String },
    otp: { type: String },
    otpExpiration: { type: Date },
    code: { type: String, required: true, unique: true },
    avatar: { type: String },

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserInfo',
      },
    ],

    friendRequests: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'UserInfo',
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    lastLoginAt: {
      type: Date,
      default: null
    },
    loginStreak: {
      type: Number,
      default: 0
    }
  },
  {
    collection: 'userInfo',
    timestamps: true,
  }
);

export const UserModel = mongoose.model('UserInfo', UserSchema);

  // DIARY ENTRY SCHEMA

const DiarySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    title: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }], // Array of image URLs
  },
  {
    collection: 'diary',
    timestamps: true,
  }
);

export const DiaryModel = mongoose.model('Diary', DiarySchema);


    // CALENDAR NOTE SCHEMA

const CalendarNoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo', required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    note: { type: String, required: true },
  },
  {
    collection: 'calendarNotes',
    timestamps: true,
  }
);

CalendarNoteSchema.index({ userId: 1, date: 1 }, { unique: true });

export const CalendarNoteModel = mongoose.model('CalendarNote', CalendarNoteSchema);


// _-----------------------------------------------------
// -----------------------------------------------------
// -----------------chat Schema ---------------------
// ----------------------------------------------------

// ----------------- Enhanced Chat Message Schema ---------------------
const ChatMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserInfo',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserInfo',
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'audio'],
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    imageUrl: String,
    audioUrl: String,
  },
  {
    collection: 'chatMessages',
    timestamps: true,
  }
);

export const ChatMessageModel = mongoose.model('ChatMessage', ChatMessageSchema);