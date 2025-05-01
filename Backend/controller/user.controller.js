import { UserModel } from "../Model/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


const otpStore = {}; 


export const finalizeRegister = async (req, res) => {
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

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

//  Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min expiration time

  otpStore[email] = { otp, expiresAt }; 

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error.message); // Log error for debugging
    res
      .status(500)
      .json({ message: "OTP sending failed", error: error.message });
  }
};

// 📩 Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const storedOtp = otpStore[email]; // Retrieve OTP from memory

  if (!storedOtp) {
    return res.status(400).json({ message: "No OTP found for this email." });
  }

  if (storedOtp.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  if (Date.now() > storedOtp.expiresAt) {
    delete otpStore[email]; // Clear expired OTP
    return res.status(400).json({ message: "OTP expired." });
  }

  // OTP is valid
  res.status(200).json({ message: "OTP verified successfully." });
};

// 🧑 Register without OTP (legacy)
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
    res.status(200).json({ message: "Created" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// 🔐 Login
export const loginUser = async (req, res) => {
  const { login, password } = req.body;
  try {
    const user = await UserModel.findOne({
      $or: [{ email: login }, { mobile: login }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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

//  Update User
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { username, email, mobile } = req.body;
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { username, email, mobile },
      { new: true }
    );
    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.status(200).json({ message: "User logged out" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
