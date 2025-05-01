import express from "express"; 
import { deleteUser, loginUser, registerUser} from "../controller/user.controller.js"
const router = express.Router();

router.post("/register" ,registerUser)
router.post("/login" ,loginUser)
// router.post("/update" ,updateuser)
router.get("/delete" ,deleteUser)




export default router