import express from 'express';
import multer from 'multer';
import { getMessages, sendMessage, editMessage, deleteMessage } from '../controller/chat.controller.js';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/send', upload.single('file'), sendMessage);
router.get('/:userId/:friendId', getMessages);
router.put('/edit/:messageId', editMessage); 
router.delete('/delete/:messageId', deleteMessage); 


export default router;