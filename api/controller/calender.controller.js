// // ---------- BACKEND: controllers/calendarController.js ----------
// import {CalendarNoteModel} from '../Model/UserModel.js';

// // POST: Add or update note
// export const createOrUpdateNote = async (req, res) => {
//   try {
//     const { userId, date, note } = req.body;
//     const existing = await CalendarNoteModel.findOne({ userId, date });
//     if (existing) {
//       existing.note = note;
//       await existing.save();
//       return res.status(200).json({ message: 'Note updated' });
//     } else {
//       const newNote = new CalendarNoteModel({ userId, date, note });
//       await newNote.save();
//       return res.status(201).json({ message: 'Note added' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving note', error });
//   }
// };

// // GET: Get all notes
// export const getAllNotes = async (req, res) => {
//   try {
//     const { userId } = req.query;
//     const notes = await CalendarNoteModel.find({ userId });
//     res.status(200).json(notes);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching notes', error });
//   }
// };

// // DELETE: Remove note by date
// export const deleteNoteByDate = async (req, res) => {
//   try {
//     const { userId } = req.query;
//     const { date } = req.params;
//     await CalendarNoteModel.deleteOne({ userId, date });
//     res.status(200).json({ message: 'Note deleted' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting note', error });
//   }
// };
// ---------- BACKEND: controller/calender.controller.js ----------
import  { CalendarNoteModel } from '../Model/UserModel.js';

// Create or update a note
export const createOrUpdateNote = async (req, res) => {
  try {
    const { userId, date, note } = req.body;
    const existing = await CalendarNoteModel.findOne({ userId, date });
    if (existing) {
      existing.note = note;
      await existing.save();
      return res.status(200).json({ message: 'Note updated' });
    } else {
      const newNote = new CalendarNoteModel({ userId, date, note });
      await newNote.save();
      return res.status(201).json({ message: 'Note added' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving note', error });
  }
};

// Get all notes (frontend filters by userId)
export const getAllNotes = async (req, res) => {
  try {
    const notes = await CalendarNoteModel.find();
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error });
  }
};

// Delete note by date and userId (userId in body)
export const deleteNoteByDate = async (req, res) => {
  try {
    const { userId, date } = req.query;
    await CalendarNote.deleteOne({ userId, date });
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error });
  }
};
