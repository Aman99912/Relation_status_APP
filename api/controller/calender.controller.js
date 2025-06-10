import { CalendarNoteModel } from '../Model/UserModel.js';

// Add or update a note
export const createOrUpdateNote = async (req, res) => {
  try {
    const { date, note } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized: User ID missing' });
    if (!date || !note) return res.status(400).json({ message: 'Date and note are required' });

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
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all notes for user
export const getAllNotes = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized: User ID missing' });

    const notes = await CalendarNoteModel.find({ userId });
    res.status(200).json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete note by date
export const deleteNoteByDate = async (req, res) => {
  try {
    const userId = req.user?.id;
    const date = req.query.date || req.user?.date;

    if (!userId) return res.status(401).json({ message: 'Unauthorized: User ID missing' });
    if (!date) return res.status(400).json({ message: 'Date is required' });

    await CalendarNoteModel.deleteOne({ userId, date });
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
