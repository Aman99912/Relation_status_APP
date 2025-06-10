import crypto from 'crypto';
import { UserModel } from "../Model/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { log } from 'console';


  const otpStore = {}; 
  


export const finalizeRegister = async (req, res) => {
  const { name, email, password, mobile, gender, dob, avatar } = req.body;

  if (!name || !email || !password || !mobile || !gender || !dob) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const lowerEmail = email.toLowerCase();

    // Check for existing email
    const existingEmail = await UserModel.findOne({ email: lowerEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Check for existing mobile
    const existingMobile = await UserModel.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ message: "Mobile number is already registered" });
    }

    // Generate unique username
    const generateUsername = (baseName) => {
      const base = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const suffix = crypto.randomBytes(2).toString('hex');
      return `${base}${suffix}`;
    };

    let username = generateUsername(name || lowerEmail.split('@')[0]);
    while (await UserModel.findOne({ username })) {
      username = generateUsername(name || lowerEmail.split('@')[0]);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const SubPass = Math.floor(1000 + Math.random() * 9000);

    // Parse DOB and calculate age
    const parseDOB = (dobString) => {
      const [day, month, year] = dobString.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    const parsedDOB = parseDOB(dob);

    const calculateAge = (birthDate) => {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const age = calculateAge(parsedDOB);

    let avatarUrl = avatar;
    if (!avatar) {
      avatarUrl = "https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
    }

    // Create user
    await UserModel.create({
      name,
      username,
      email: lowerEmail,
      code,
      SubPass,
      dob: parsedDOB,
      age,
      gender,
      password: hashedPassword,
      mobile,
      avatar: avatarUrl,
    });

    // Send welcome email
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
      text: `Hello ${name},\n\nThank you for signing up!\n\nYour login details:\nUsername: ${username}\nTemporary Passcode: ${SubPass}\n\nPlease keep your credentials safe.\n\nBest regards,\nThe Team`,
    };

    await transporter.sendMail(mailOptions);

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
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    token, 
  },
});

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};



// ✏️ Update User
// export const updateUser = async (req, res) => {
//   try {
//     const id = req.params.id; // id should be passed in URL params
//     const {
//       username,
//       email,
//       mobile,
//       bio,
//       gender,
//       age,
//       avatar,
//     } = req.body;

//     // Optional: you can add validation here for required fields or format

//     const updatedUser = await UserModel.findByIdAndUpdate(
//       id,
//       {
//         username,
//         email,
//         mobile,
//         bio,
//         gender,
//         age,
//         avatar,
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ message: "User updated successfully", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// export const updateUser = async (req, res) => {
//   try {
//     const id = req.params.id; // ID of the user to update

//     const {
//       username,
//       email,
//       mobile,
//       bio,
//       gender,
//       age,
//       avatar,
//     } = req.body;

   
//     if (username) {
//       const existingUser = await UserModel.findOne({ username, _id: { $ne: id } });
//       if (existingUser) {
//         return res.status(400).json({ message: "Username is already taken" });
//       }
//     }

//     // Step 2: Update the user
//     const updatedUser = await UserModel.findByIdAndUpdate(
//       id,
//       { username, email, mobile, bio, gender, age, avatar },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ message: "User updated successfully", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { username, email, mobile, bio, gender, age, avatar } = req.body;

    // Validate username uniqueness if provided
    if (username) {
      const existingUser = await UserModel.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    // Prepare update object
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (mobile) updateFields.mobile = mobile;
    if (bio) updateFields.bio = bio;
    if (gender) updateFields.gender = gender;
    if (age) updateFields.age = age;
    
    // Only update avatar if it's provided and not empty
    if (avatar && avatar.trim() !== '') {
      updateFields.avatar = avatar;
    }

    // Update the user
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "User updated successfully", 
      user: updatedUser 
    });
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
      select: 'username name email gender avatar',
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


export const getUserByCode = async (req, res) => {
  const { code } = req.query;

  try {
    const user = await UserModel.findOne({ code })
      .select('name avatar friends friendRequests')
      .populate('friendRequests.from', '_id')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  
  
    return res.status(200).json({
      success: true,
      id: user._id,
      fullname: user.name,
      avatarUrl: user.avatar || null,
      friends: user.friends?.map(friendId => friendId.toString()) || [],
      friendRequests: user.friendRequests?.map(req => req.from?._id.toString()) || [],
    });
  } catch (err) {
    console.error('Error during fetching user by code:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};



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
      username: user.username,
      bio: user.bio,
      age: user.age,
      mobileNo: user.mobile,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
