import crypto from 'crypto';
import { UserModel } from "../Model/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const otpStore = {}; 

export const finalizeRegister = async (req, res) => {
  const { name, email, password, mobile, gender, dob, avatar } = req.body; 

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

    const existingMobile = await UserModel.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ message: "Mobile number already registered" });
    }

    // Generate unique 10-digit numeric code
    const code = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Generate 4-digit numeric temporary passcode
    const SubPass = Math.floor(1000 + Math.random() * 9000);

    // Generate unique username
    const generateUsername = (baseName) => {
      const base = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const suffix = crypto.randomBytes(2).toString('hex'); // 4 chars
      return `${base}${suffix}`;
    };

    let username = generateUsername(name || email.split('@')[0]);
    while (await UserModel.findOne({ username })) {
      username = generateUsername(name || email.split('@')[0]);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse DOB (DD/MM/YYYY)
    const parseDOB = (dobString) => {
      const [day, month, year] = dobString.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    const parsedDOB = parseDOB(dob);

    // Assign default avatar if not provided
    let avatarUrl = avatar;
    if (!avatar) {
      avatarUrl = gender.toLowerCase() === 'female' 
        ? 'https://static.vecteezy.com/system/resources/previews/028/597/534/original/young-cartoon-female-avatar-student-character-wearing-eyeglasses-file-no-background-ai-generated-png.png'
        : 'https://png.pngtree.com/png-clipart/20231015/original/pngtree-man-avatar-clipart-illustration-png-image_13302499.png';
    }

    // Create user
    await UserModel.create({
      name,
      username,
      email,
      code,
      SubPass,
      dob: parsedDOB,
      gender,
      password: hashedPassword,
      mobile,
      avatar: avatarUrl, // use default if needed
    });

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_ID,
      to: email,
      subject: "Welcome to Our Service!",
      text: `Hello ${name},\n\nThank you for signing up!\n\nYour login details:\nUsername: ${username}\nTemporary Passcode: ${SubPass}\n\nPlease keep your credentials safe.\n\nBest regards,\nThe Team`,
    };

    // Send mail
    await transporter.sendMail(mailOptions);

    // Final success response
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  try {
    const user = await UserModel.findOne({email});

    if (!user) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      status: "ok",
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        // Add other fields if needed
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
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
    res.clearCookie('token');
    return res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};




export const PassVerify = async (req, res) => {
  const { UserPass, email } = req.body;
  
  try {
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.SubPass !== UserPass) {
      return res.status(400).json({ success: false, message: 'Invalid Secret Code' });
    }
    
    return res.status(200).json({ success: true, message: 'Secret Code verified successfully' });
  } catch (err) {
    console.error('Error during Secret Code verification:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get all friends of a user by email
export const GetUserFriends = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await UserModel.findOne({ email }).populate({
      path: 'friends',
      select: 'username email gender avatar',
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const friendsList = user.friends || [];

    return res.json({ success: true, friends: friendsList, userId: user._id });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a user by their unique code
export const getUserByCode = async (req, res) => {
  const { code } = req.query;

  try {
    const user = await UserModel.findOne( {code} )

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      id: user._id,
      fullname: user.name,
      avatarUrl: user.avatar || null,
    });
  } catch (err) {
    console.error('Error during fetching user by code:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user by email from route param
// export const GetUserByEmail = async (req, res) => {
//   const { email } = req.params;

//   try {
//   const user = await UserModel.findOne( email );

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     return res.status(200).json({
//       success: true,
//       id: user._id,
//       avatar: user.avatar,
//       code: user.code,
//       fullname: user.name,
//       gender: user.gender,
//       email: user.email,
//     });
//   } catch (err) {
//     console.error('Error during fetching user:', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// };
export const GetUserByEmail = async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase(); 
    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      id: user._id,
      code: user.code,
      fullname: user.name,
      avatar: user.avatar,
      gender: user.gender,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
