import express from "express";
import {
  loginUser,
  updateUser,
  sendOtp,
  finalizeRegister,
  logoutUser,
  verifyOtp,
} from "../controller/user.controller.js";

import {
  forgotPassword,
  resetPassword,
  verifyPasswordOtp,
} from "../controller/forgotPass.controller.js";

import { verifyToken } from "../middlewar/middleware.js"; // ✅ Make sure the path is correct (should be "middleware" not "middlewar" if that's a typo)


const router = express.Router();

// ✅ Routes without middleware
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", finalizeRegister);
router.post("/forgot-password", forgotPassword);
router.post("/verify-password-otp", verifyPasswordOtp);
router.post("/reset-password", resetPassword);


// ✅ Routes that need authentication
router.put("/update/:id", verifyToken, updateUser); // middleware applied to this route only

export default router;
