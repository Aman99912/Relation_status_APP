import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import userRoutes from "./routes/user.route.js";
import cors from 'cors'

const app = express();
app.use(cors())
dotenv.config();

app.use(express.json())

app.use("/api/user", userRoutes )


app.use("/", (req, res)=>{
  res.send("Hello from backend");
})

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
 console.log("Database connected");
}).catch(()=>{
  console.log("Error");
})

const PORT = process.env.PORT || 3000 


app.listen(PORT , ()=>{
  console.log(`Server is start at port ${PORT}`);
  
})
