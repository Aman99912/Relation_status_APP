import { UserModel } from "../Model/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



export const registerUser = async (req, res) => {
    const { username, email, password, mobile } = req.body;
    try {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await UserModel.create({
        username,
        email,
        password: hashedPassword,
        mobile,
      });
      res.status(200).json({ massage:"Created"})
    } catch (error) {
      res.status(500).json({ status: "error:-------", message: error.message });
    }
  };

  export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ status: "error", message: "Invalid credentials" });
      }
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
      res.send({
        status: "ok",
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
    }
  };
  export const deleteUser = async (req, res) => {
    try {
       const id = req.params.id; await UserModel.findByIdAndDelete(id);
      res.status(200).json({ message: "Delete User route is working." });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };