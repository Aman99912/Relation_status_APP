
import express from 'express';
import multer from 'multer';
import { getMessages, sendMessage } from '../controller/chat.controller.js';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/send', upload.single('file'), sendMessage);
router.get('/:userId/:friendId', getMessages);

export default router;
