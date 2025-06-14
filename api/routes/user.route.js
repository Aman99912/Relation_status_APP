import express from "express";
import {
  loginUser,
  updateUser,
  sendOtp,
  finalizeRegister,
  logoutUser,
  verifyOtp,
  // GetUserByEmail,
  PassVerify,
  getUserByCode,
  GetUserFriends,
  GetUserById,
} from "../controller/user.controller.js";
import {
  resetPassword,
  SendForgotPass,
  verifyForgotOtp,
} from "../controller/forgotPass.controller.js";
import { verifyToken } from "../middlewar/middleware.js"; 
import { GetFriendNotif, getFriendRequests, respondToRequest, sendFriendRequest } from "../controller/Notif.js";
import { addDiary, getAllEntries  } from "../controller/DiaryController.js";
import { createOrUpdateNote, deleteNoteByDate, getAllNotes } from "../controller/calender.controller.js";


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
router.get('/friend',verifyToken, GetUserFriends);
// router.get('/email', GetUserByEmail);
router.get('/id',verifyToken, GetUserById);
router.get('/code',verifyToken, getUserByCode);
router.put("/update/:id", verifyToken, updateUser);


// add frnd
router.get('/friendnotif',verifyToken, GetFriendNotif);
router.post('/send-req',verifyToken, sendFriendRequest);
router.get('/requests/:userId',verifyToken, getFriendRequests);
router.post('/respond',verifyToken, respondToRequest);

//diary routes

router.post('/add-diary',verifyToken, addDiary)
router.get('/userId-diary',verifyToken, getAllEntries)

//calender route
router.post('/create',verifyToken , createOrUpdateNote);
router.get('/get/id',verifyToken , getAllNotes);
router.delete('/delete',verifyToken , deleteNoteByDate);
export default router;
