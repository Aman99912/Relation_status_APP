

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from "./routes/user.route.js";

dotenv.config(); // ✅ Load env before using it

const app = express();


// ✅ Middleware
app.use(cors({
  origin: "*",
}));
app.use(express.json()); // ✅ Required for req.body parsing
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/user", userRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ Hello from backend");
});

// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Database connected");
}).catch((err) => {
  console.error("❌ Database connection failed:", err.message);
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
