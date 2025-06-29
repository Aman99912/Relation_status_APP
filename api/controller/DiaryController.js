


import mongoose from 'mongoose';
import { DiaryModel } from '../Model/UserModel.js'; 

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

export const getAllEntries = async (req, res) => {
  try {
    const userID = req.query.userID;
    if (!userID) {
      return res.status(400).json({ success: false, message: 'userID query parameter is required' });
    }

    const userIdObject = new mongoose.Types.ObjectId(userID);

    // Modified query: Only fetch entries where isDeleted is false
    const entries = await DiaryModel.find({ userId: userIdObject, isDeleted: false }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Note: Ensure DiaryModel is accessible here, not 'DiaryEntry'
export const deleteDiaryEntry = async (req, res) => { // Changed from exports.deleteDiaryEntry to export const if using ES modules
    try {
        const { entryId } = req.params;
        const userIdFromToken = req.user.id; // From your authentication middleware

        // Use DiaryModel consistent with your import
        const entry = await DiaryModel.findById(entryId);

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Diary entry not found.' });
        }

        if (entry.userId.toString() !== userIdFromToken) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this entry.' });
        }

        // Perform soft delete: Set isDeleted to true
        await DiaryModel.findByIdAndUpdate(entryId, { isDeleted: true });

        res.status(200).json({ success: true, message: 'Diary entry removed from your view.' });
    } catch (error) {
        console.error('Error soft-deleting diary entry:', error);
        res.status(500).json({ success: false, message: 'Server error while performing soft delete.' });
    }
};