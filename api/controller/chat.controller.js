import { ChatMessageModel } from "../Model/UserModel.js";


export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text, messageType } = req.body;
    let imageUrl = '', audioUrl = '';

    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`;
      if (messageType === 'image' || messageType === 'gif' || messageType === 'sticker') {
        imageUrl = filePath;
      } else if (messageType === 'audio') {
        audioUrl = filePath;
      }
    }

    const message = new ChatMessageModel({
      senderId,
      receiverId,
      messageType,
      text,
      imageUrl,
      audioUrl,
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const getMessages = async (req, res) => {
  const { userId, friendId } = req.params;

  try {
    const messages = await ChatMessageModel.find({
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};
