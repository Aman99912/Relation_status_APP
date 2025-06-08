import express from 'express';
import { getChats, sendMessage } from '../controller/chat.controller.js';


const router = express.Router();

router.post('/send', sendMessage);
router.get('/', getChats);

export default router;
