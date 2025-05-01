import express from "express";
import {
 
  loginUser,
  updateUser,
  sendOtp,

  finalizeRegister,
  logoutUser,
  verifyOtp
} from "../controller/user.controller.js";
import { 
         forgotPassword, 
         resetPassword,
         verifyPasswordOtp,
          } from "../controller/forgotPass.controller.js";

const router = express.Router();

// Auth Routes 
router.post("/login", loginUser);  
router.post("/logout", logoutUser);  
router.put("/update/:id", updateUser); 


//OTP 
router.post("/send-otp", sendOtp);  
router.post("/verify-otp", verifyOtp);  
router.post("/finalize-register", finalizeRegister);  

//forgot password

router.post('/forgot-password', forgotPassword); 
router.post('/verify-password-otp', verifyPasswordOtp); 
router.post('/reset-password', resetPassword); 

export default router;
