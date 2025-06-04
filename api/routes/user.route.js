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
  getUserByCode,
  GetUserFriends,
} from "../controller/user.controller.js";
import {
  resetPassword,
  SendForgotPass,
  verifyForgotOtp,
} from "../controller/forgotPass.controller.js";
import { verifyToken } from "../middlewar/middleware.js"; 
import { GetFriendNotif, getFriendRequests, respondToRequest, sendFriendRequest } from "../controller/Notif.js";
import { addDiary, getAllEntries  } from "../controller/DiaryController.js";


const router = express.Router();

// ✅ Routes without middleware
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/send-otp", sendOtp);
router.post("/verify-pass", PassVerify);
router.post("/verify-otp", verifyOtp);
router.post("/register", finalizeRegister);
router.post("/forgot-password", SendForgotPass);
router.post("/verify-password-otp", verifyForgotOtp);
router.post("/reset-password",resetPassword);

// ✅ Routes that need authentication
router.get('/friend', GetUserFriends);
router.get('/email', GetUserByEmail);
router.get('/code', getUserByCode);
router.put("/update/:id", verifyToken, updateUser); // middleware applied to this route only


// add frnd
router.get('/friendnotif', GetFriendNotif);
router.post('/send-req', sendFriendRequest);
router.get('/requests/:userId', getFriendRequests);
router.post('/respond', respondToRequest);

//diary routes

router.post('/add-diary', addDiary)
router.get('/userId-diary', getAllEntries)

export default router;
