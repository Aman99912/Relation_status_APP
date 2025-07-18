
import express, { Router } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/user.route.js';
import router from './routes/chatRoute.js';
import { ChatMessageModel } from './Model/UserModel.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`Registered user ${userId} with socket ${socket.id}`);
    // Broadcast online status
    io.emit('user_online', { userId });
  });

  // SOCKET CHAT HANDLER
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, text, messageType, imageUrl = '', audioUrl = '' } = data;
      const message = new ChatMessageModel({
        senderId,
        receiverId,
        messageType,
        text,
        imageUrl,
        audioUrl,
      });
      await message.save();
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', message);
        // Emit delivered status
        io.to(socket.id).emit('delivered', { messageId: message._id, receiverId });
      }
      socket.emit('receive_message', message);
    } catch (err) {
      console.error('Socket send_message error:', err);
      socket.emit('error_message', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { senderId });
    }
  });

  // Seen status
  socket.on('seen', ({ messageId, userId, friendId }) => {
    const friendSocketId = connectedUsers.get(friendId);
    if (friendSocketId) {
      io.to(friendSocketId).emit('seen', { messageId, userId });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    let disconnectedUserId = null;
    for (let [key, value] of connectedUsers.entries()) {
      if (value === socket.id) {
        disconnectedUserId = key;
        connectedUsers.delete(key);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit('user_offline', { userId: disconnectedUserId });
    }
  });
});

app.set('io', io);
app.set('connectedUsers', connectedUsers);

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/user', userRoutes);
app.use('/api/chats', router);

app.get('/', (req, res) => {
  res.send('Hello from backend');
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected');
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});