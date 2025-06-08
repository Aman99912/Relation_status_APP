
import express, { Router } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

import userRoutes from './routes/user.route.js';
import router from './routes/chatRoute.js';



dotenv.config();

const app = express();
const server = http.createServer(app); // 👉 wrap express in http server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ✅ Store socket instances by userId
const connectedUsers = new Map();

// ✅ Socket.IO setup
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  // Receive and store userId with socket.id
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`📲 Registered user ${userId} with socket ${socket.id}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    for (let [key, value] of connectedUsers.entries()) {
      if (value === socket.id) {
        connectedUsers.delete(key);
        break;
      }
    }
  });
});

// ✅ Attach io to app for use in routes/controllers
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// ✅ Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/user', userRoutes);
app.use('/api/chat', router);

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Hello from backend');
});

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Database connected');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
