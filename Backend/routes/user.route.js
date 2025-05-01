import express from "express";
import {
  registerUser,
  loginUser,
  updateUser,
  sendOtp,
  verifyOtp,
  finalizeRegister,
  logoutUser
} from "../controller/user.controller.js";

const router = express.Router();

// Auth Routes
router.post("/register", registerUser);  
router.post("/login", loginUser);  
router.post("/logout", logoutUser);  

router.put("/update/:id", updateUser); 


//OTP 
router.post("/send-otp", sendOtp);  
router.post("/verify-otp", verifyOtp);  
router.post("/finalize-register", finalizeRegister);  

export default router;
