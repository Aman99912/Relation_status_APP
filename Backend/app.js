// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv'
// import userRoutes from "./routes/user.route.js";
// import cors from 'cors'

// const app = express();
// app.use(cors())
// dotenv.config();

// app.use(express.json())

// app.use("/api/user", userRoutes )


// app.use("/", (req, res)=>{
//   res.send("Hello from backend");
// })

// mongoose.connect(process.env.MONGO_URL)
// .then(()=>{
//  console.log("Database connected");
// }).catch(()=>{
//   console.log("Error");
// })

// const PORT = process.env.PORT || 3000 


// app.listen(PORT , ()=>{
//   console.log(`Server is start at port ${PORT}`);
  
// })

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from "./routes/user.route.js";

dotenv.config(); // ✅ Load env before using it

const app = express();


// ✅ Middleware
app.use(cors());
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
