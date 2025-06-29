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
  GetDashboardData,
} from "../controller/user.controller.js";
import {
  changePassword,
  generateSubPassCode,
  resetPassword,
  SendForgotPass,
  setSubPassword,
  verifyForgotOtp,
} from "../controller/forgotPass.controller.js";
import { verifyToken } from "../middlewar/middleware.js"; 
import { GetFriendNotif, getFriendRequests, respondToRequest, sendFriendRequest } from "../controller/Notif.js";
import { addDiary, deleteDiaryEntry, getAllEntries  } from "../controller/DiaryController.js";
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
router.get('/dashboard/id',verifyToken, GetDashboardData);
router.get('/code',verifyToken, getUserByCode);
router.put("/update/:id", verifyToken, updateUser);
router.post('/change-password',verifyToken,changePassword)
router.post('/set-subpassword',verifyToken,setSubPassword)
router.post('/generate-SubPassCode',verifyToken,generateSubPassCode)


// add frnd
router.get('/friendnotif',verifyToken, GetFriendNotif);
router.post('/send-req',verifyToken, sendFriendRequest);
router.get('/requests/:userId',verifyToken, getFriendRequests);
router.post('/respond',verifyToken, respondToRequest);

//diary routes

router.post('/add-diary',verifyToken, addDiary)
router.get('/userId-diary',verifyToken, getAllEntries)
router.delete('/diary/:entryId',verifyToken, deleteDiaryEntry)

//calender route
router.post('/calendar/create',verifyToken , createOrUpdateNote);
router.get('/calendar/get/id',verifyToken , getAllNotes);
router.delete('/calendar/delete',verifyToken , deleteNoteByDate);


export default router;
