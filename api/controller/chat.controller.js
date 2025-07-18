import { ChatMessageModel } from "../Model/UserModel.js";


export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text, messageType } = req.body;
    let imageUrl = '', audioUrl = '';

    if (req.file) {
      const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
      const filePath = `${serverBaseUrl}/uploads/${req.file.filename}`;

      if (messageType === 'image' || messageType === 'gif' || messageType === 'sticker') {
        imageUrl = filePath;
      } else if (messageType === 'audio') {
        audioUrl = filePath;
      }
    } else if (messageType === 'gif' && req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
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
    // Emit socket event for real-time delivery
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    if (io && connectedUsers) {
      const receiverSocketId = connectedUsers.get(receiverId.toString());
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', message);
      }
      // Optionally, emit to sender as well
      const senderSocketId = connectedUsers.get(senderId.toString());
      if (senderSocketId) {
        io.to(senderSocketId).emit('receive_message', message);
      }
    }
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

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const formattedMessages = messages.map(msg => {
      let updatedImageUrl = msg.imageUrl;
      let updatedAudioUrl = msg.audioUrl;

      if (updatedImageUrl && updatedImageUrl.startsWith('/uploads/') && !updatedImageUrl.startsWith('http')) {
        updatedImageUrl = `${baseUrl}${updatedImageUrl}`;
      }
      if (updatedAudioUrl && updatedAudioUrl.startsWith('/uploads/') && !updatedAudioUrl.startsWith('http')) {
        updatedAudioUrl = `${baseUrl}${updatedAudioUrl}`;
      }

      return {
        ...msg.toObject(),
        imageUrl: updatedImageUrl,
        audioUrl: updatedAudioUrl,
      };
    });

    res.status(200).json(formattedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    const updatedMessage = await ChatMessageModel.findByIdAndUpdate(
      messageId,
      { $set: { text: text, edited: true } },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json(updatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to edit message' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await ChatMessageModel.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully', deletedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete message' });
  }
};