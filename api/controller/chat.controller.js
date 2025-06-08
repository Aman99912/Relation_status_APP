import { Chat } from "../Model/UserModel.js";


// Save message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    const newChat = new Chat({
      senderId,
      receiverId,
      message,
    });

    const saved = await newChat.save();

    res.status(201).json({ success: true, message: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chats between two users
export const getChats = async (req, res) => {
  const { user1, user2 } = req.query;
  try {
    const chats = await Chat.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar');

    res.status(200).json({ success: true, messages: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
