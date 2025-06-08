
import { CalendarNoteModel } from '../Model/UserModel.js';


export const createOrUpdateNote = async (req, res) => {
  try {
    const { date, note } = req.body;
    const userId = req.user.id; 
    console.log(date , note , userId);
    

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
    res.status(500).json({ message: 'Error saving note ', error });
  }
};


export const getAllNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const notes = await CalendarNoteModel.find({ userId });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error });
  }
};


export const deleteNoteByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;
    await CalendarNoteModel.deleteOne({ userId, date });
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error });
  }
};
