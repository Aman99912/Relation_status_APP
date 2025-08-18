// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import { Server } from 'socket.io';
// import http from 'http';
// import path from 'path';
// import { fileURLToPath } from 'url';

// import userRoutes from './routes/user.route.js';
// import router from './routes/chatRoute.js';
// import { ChatMessageModel } from './Model/UserModel.js';

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });

// const connectedUsers = new Map();

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   socket.on('register', (userId) => {
//     connectedUsers.set(userId, socket.id);
//     console.log(`Registered user ${userId} with socket ${socket.id}`);
//     socket.broadcast.emit('user_online', { userId });
//   });

//   // Check initial online status for a specific friend
//   socket.on('check_online_status', ({ friendId }) => {
//     if (connectedUsers.has(friendId)) {
//       socket.emit('user_online', { userId: friendId });
//     }
//   });

//   // SOCKET CHAT HANDLER
//   socket.on('send_message', async (data) => {
//     try {
//       const { tempId, senderId, receiverId, text, messageType, imageUrl = '', audioUrl = '' } = data;
//       const message = new ChatMessageModel({
//         senderId,
//         receiverId,
//         messageType,
//         text,
//         imageUrl,
//         audioUrl,
//       });
//       await message.save();
      
//       const receiverSocketId = connectedUsers.get(receiverId);
      
//       // Send to receiver if they are online
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit('receive_message', message);
//       }
//       // Send confirmation back to the sender with the final message object (including the real _id)
//       io.to(socket.id).emit('receive_message', message);

//     } catch (err) {
//       console.error('Socket send_message error:', err);
//       socket.emit('error_message', { message: 'Failed to send message' });
//     }
//   });

//   // Typing indicator
//   socket.on('typing', ({ senderId, receiverId }) => {
//     const receiverSocketId = connectedUsers.get(receiverId);
//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit('typing', { senderId });
//     }
//   });

//   // Mark messages as seen
//   socket.on('mark_as_seen', ({ messageIds, userId, friendId }) => {
//     const friendSocketId = connectedUsers.get(friendId);
//     if (friendSocketId) {
//         io.to(friendSocketId).emit('seen', { messageIds, userId });
//     }
//   });

//   // --- LOCATION SHARING HANDLERS ---

//   socket.on('join-location-room', ({ userId, friendId }) => {
//     const roomName = [userId, friendId].sort().join('-');
//     socket.join(roomName);
//     console.log(`Socket ${socket.id} (User ${userId}) joined location room: ${roomName}`);
    
//     // **FIX:** Inform the friend that you have started sharing location
//     socket.to(roomName).emit('friend-started-sharing', { userId });
//   });
  
//   socket.on('location-update', ({ userId, friendId, location }) => {
//     const roomName = [userId, friendId].sort().join('-');
//     socket.to(roomName).emit('friend-location-update', location);
//   });

//   socket.on('stop-sharing', ({ userId, friendId, lastLocation }) => {
//     const roomName = [userId, friendId].sort().join('-');
//     const data = { lastLocation: lastLocation, lastSeen: new Date() };
//     socket.to(roomName).emit('friend-went-offline', data);
//     socket.leave(roomName);
//     console.log(`Socket ${socket.id} (User ${userId}) left location room: ${roomName}`);
//   });

//   // --- END OF LOCATION HANDLERS ---

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//     let disconnectedUserId = null;
//     for (let [key, value] of connectedUsers.entries()) {
//       if (value === socket.id) {
//         disconnectedUserId = key;
//         connectedUsers.delete(key);
//         break;
//       }
//     }
//     if (disconnectedUserId) {
//       io.emit('user_offline', { userId: disconnectedUserId });
//       console.log(`User ${disconnectedUserId} went offline.`);
//     }
//   });
// });

// app.set('io', io);

// app.use(cors({ origin: '*' }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use('/api/user', userRoutes);
// app.use('/api/chats', router);

// app.get('/', (req, res) => {
//   res.send('Hello from backend');
// });

// mongoose
//   .connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log('Database connected');
//   })
//   .catch((err) => {
//     console.error('Database connection failed:', err.message);
//   });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import express from 'express';
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
    socket.broadcast.emit('user_online', { userId });
  });

  socket.on('check_online_status', ({ friendId }) => {
    if (connectedUsers.has(friendId)) {
      socket.emit('user_online', { userId: friendId });
    }
  });

  // SOCKET CHAT HANDLER
  socket.on('send_message', async (data) => {
    try {
      const { tempId, senderId, receiverId, text, messageType, imageUrl = '', audioUrl = '' } = data;
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
      }
      io.to(socket.id).emit('receive_message', message);

    } catch (err) {
      console.error('Socket send_message error:', err);
      socket.emit('error_message', { message: 'Failed to send message' });
    }
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { senderId });
    }
  });

  socket.on('mark_as_seen', ({ messageIds, userId, friendId }) => {
    const friendSocketId = connectedUsers.get(friendId);
    if (friendSocketId) {
        io.to(friendSocketId).emit('seen', { messageIds, userId });
    }
  });

  // --- LOCATION SHARING HANDLERS ---
  socket.on('join-location-room', ({ userId, friendId }) => {
    const roomName = [userId, friendId].sort().join('-');
    socket.join(roomName);
    console.log(`Socket ${socket.id} (User ${userId}) joined location room: ${roomName}`);
    socket.to(roomName).emit('friend-started-sharing', { userId });
  });
  
  socket.on('location-update', ({ userId, friendId, location }) => {
    const roomName = [userId, friendId].sort().join('-');
    socket.to(roomName).emit('friend-location-update', location);
  });

  socket.on('stop-sharing', ({ userId, friendId, lastLocation }) => {
    const roomName = [userId, friendId].sort().join('-');
    const data = { lastLocation: lastLocation, lastSeen: new Date() };
    socket.to(roomName).emit('friend-went-offline', data);
    socket.leave(roomName);
    console.log(`Socket ${socket.id} (User ${userId}) left location room: ${roomName}`);
  });

  // --- WATCH PARTY HANDLERS (NEW CODE) ---
  socket.on('join-watch-party', ({ userId, friendId }) => {
    const roomName = ['party', userId, friendId].sort().join('-');
    socket.join(roomName);
    console.log(`User ${userId} joined watch party room: ${roomName}`);
  });

  socket.on('video-control', ({ userId, friendId, control }) => {
    const roomName = ['party', userId, friendId].sort().join('-');
    // Send the control event to the other user in the room
    socket.to(roomName).emit('friend-video-control', control);
  });

  socket.on('leave-watch-party', ({ userId, friendId }) => {
    const roomName = ['party', userId, friendId].sort().join('-');
    socket.leave(roomName);
    console.log(`User ${userId} left watch party room: ${roomName}`);
  });
  // --- END OF WATCH PARTY HANDLERS ---

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
      console.log(`User ${disconnectedUserId} went offline.`);
    }
  });
});

app.set('io', io);

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