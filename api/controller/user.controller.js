import crypto from 'crypto';
import { UserModel } from "../Model/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const otpStore = {}; 

export const finalizeRegister = async (req, res) => {
  const { name, email, password, mobile, gender, dob } = req.body;

  // Basic validation
  if (!name || !email || !password || !mobile || !gender || !dob) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate unique code
    const code = crypto.randomBytes(10).toString('hex') + Math.random().toString(36).slice(2, 6);

    // Generate 4-digit PIN
    const Pass = Math.floor(1000 + Math.random() * 9000);

    // Generate username
    const generateUsername = (baseName) => {
      const base = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const suffix = crypto.randomBytes(2).toString('hex'); // 4 random chars
      return `${base}${suffix}`;
    };

    let username = generateUsername(name || email.split('@')[0]);
    while (await UserModel.findOne({ username })) {
      username = generateUsername(name || email.split('@')[0]);
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const parseDOB = (dobString) => {
  const [day, month, year] = dobString.split('/');
  return new Date(`${year}-${month}-${day}`);
};


const parsedDOB = parseDOB(dob); 

   await UserModel.create({
  name,
  username,
  email,
  code,
  Pass,
  dob: parsedDOB,
  gender,
  password: hashedPassword,
  mobile,
});


  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: "Welcome to Our Service!",
      text: `Hello ${name},\n\nThank you for signing up! Here are your login details:\n\nUsername: ${username}\n Temporary Passcode: ${Pass}\n\nPlease keep your credentials safe.\n\nBest regards,\nThe Team`,
    };

    await transporter.sendMail(mailOptions);

    // Final response
    res.status(200).json({
      success: true,
      message: "User created successfully",
      username,
    });

  } catch (error) {
    console.error("Error in finalizeRegister:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};






export const GetUserByEmail = async (req, res) => {
  const { email } = req.params;
  
  try {
    // Find the user in the database and return only the 'code' field
    const user = await UserModel.findOne({ email }, 'code'); // Specify 'code' field
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send the code data as a response
    return res.json({ success: true, code: user.code }); // Return the 'code' directly
  } catch (err) {
    console.error('Error during fetching user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

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
    console.error("Error sending OTP:", error.message);
    res.status(500).json({ message: "OTP sending failed", error: error.message });
  }
};


// ✅ Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const storedOtp = otpStore[email];

  if (!storedOtp) {
    return res.status(400).json({ message: "No OTP found for this email." });
  }

  if (storedOtp.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  if (Date.now() > storedOtp.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired." });
  }

  res.status(200).json({ message: "OTP verified successfully." });
};

// 🔐 Login (email, mobile or username + password)
export const loginUser = async (req, res) => {
  const { login, password } = req.body;

  try {
    const user = await UserModel.findOne({
      $or: [
        { email: login },
        { mobile: login },
        { username: login },
      ],
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
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

// ✏️ Update User
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

// 🚪 Logout
export const logoutUser = async (req, res) => {
  try {
   res.clearCookie("token");
res.status(200).json({ message: "User logged out successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const PassVerify = async (req, res) => {
  const { Pass, email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    
    if (user.Pass !== Pass) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP is valid, now proceed with password verification or any additional logic
    return res.json({ success: true, message: 'OTP verified successfully', password: user.password });
  } catch (err) {
    console.error('Error during OTP verification:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
