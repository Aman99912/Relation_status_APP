import express from "express";
import {
  loginUser,
  updateUser,
  sendOtp,
  finalizeRegister,
  logoutUser,
  verifyOtp,
  GetUserByEmail,
  PassVerify,
} from "../controller/user.controller.js";

import {
 
  resetPassword,
  SendForgotPass,

} from "../controller/forgotPass.controller.js";

import { verifyToken } from "../middlewar/middleware.js"; // ✅ Make sure the path is correct (should be "middleware" not "middlewar" if that's a typo)


const router = express.Router();

// ✅ Routes without middleware
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/send-otp", sendOtp);
router.post("/verify-Pass", PassVerify);
router.post("/verify-otp", verifyOtp);
router.get('/email/:email', GetUserByEmail);
router.post("/register", finalizeRegister);
router.post("/forgot-password", SendForgotPass);
router.post("/reset-password",resetPassword);

// ✅ Routes that need authentication
router.put("/update/:id", verifyToken, updateUser); // middleware applied to this route only

export default router;
