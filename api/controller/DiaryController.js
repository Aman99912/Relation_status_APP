import mongoose from 'mongoose';
import { DiaryModel } from '../Model/UserModel.js'; // Adjust path if models.js is in another folder


export const addDiary = async (req, res) => {
  try {
    const { userId, title, description, images } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newEntry = new DiaryModel({
      userId,
      title,
      description,
      images,
    });

    await newEntry.save();

    res.status(200).json({ success: true, entry: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// import mongoose from 'mongoose';

export const getAllEntries = async (req, res) => {
  try {
    const userID = req.query.userID; // Note: use same case as in URL (userID)
    if (!userID) {
      return res.status(400).json({ success: false, message: 'userID query parameter is required' });
    }

    const userIdObject = new mongoose.Types.ObjectId(userID);  // Convert string to ObjectId

    const entries = await DiaryModel.find({ userId: userIdObject }).sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
