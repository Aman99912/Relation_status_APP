import crypto from 'crypto';
import { CalendarNoteModel, ChatMessageModel, DiaryModel, UserModel } from "../Model/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";



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

  if (!email) return res.status(400).json({ message: "Email is required" });

  const now = Date.now();
  const userOtpData = otpStore[email] || {};

  if (userOtpData.resendBlockedUntil && now < userOtpData.resendBlockedUntil) {
    const wait = Math.ceil((userOtpData.resendBlockedUntil - now) / 1000);
    return res.status(429).json({ message: `Resend blocked. Try again in ${wait}s.` });
  }

  // Count resend logic
  const resendCount = (userOtpData.resendCount || 0) + 1;
  let resendBlockedUntil = null;

  if (resendCount >= 7) {
    resendBlockedUntil = now + 5 * 60 * 1000; // 5 min block
  } else if (resendCount === 4) {
    resendBlockedUntil = now + 60 * 1000; // 1 min block
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000;

  otpStore[email] = {
    ...userOtpData,
    otp,
    expiresAt,
    wrongAttempts: 0,
    blockUntil: null,
    resendCount,
    resendBlockedUntil,
  };

  try {
    console.log(otp)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "OTP sending failed", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const userOtpData = otpStore[email];
  const now = Date.now();

  if (!userOtpData) {
    return res.status(400).json({ message: "No OTP found for this email." });
  }

  if (userOtpData.blockUntil && now < userOtpData.blockUntil) {
    const wait = Math.ceil((userOtpData.blockUntil - now) / 1000);
    return res.status(429).json({ message: `Too many wrong attempts. Try again in ${wait}s.` });
  }

  if (now > userOtpData.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }

  if (userOtpData.otp !== otp) {
    userOtpData.wrongAttempts = (userOtpData.wrongAttempts || 0) + 1;

    if (userOtpData.wrongAttempts === 5) {
      userOtpData.blockUntil = now + 30 * 1000;
    } else if (userOtpData.wrongAttempts >= 9) {
      userOtpData.blockUntil = now + 2 * 60 * 1000;
    }

    return res.status(400).json({ message: "Invalid OTP." });
  }

  delete otpStore[email];
  res.status(200).json({ message: "OTP verified successfully." });
};




export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }

    const now = new Date();
    let currentStreak = user.loginStreak || 0;
    const lastLogin = user.lastLoginAt;

    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

      if (lastLoginDate.getTime() === yesterday.getTime()) {
        currentStreak += 1;
      } else if (lastLoginDate.getTime() === today.getTime()) {
        // Same day login, streak continues
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    user.lastLoginAt = now;
    user.loginStreak = currentStreak;
    await user.save();

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
        loginStreak: user.loginStreak,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};














export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    let { username, email, mobile, bio, gender, age, avatar } = req.body;

    const updateFields = {};

    // Username check
    if (username) {
      const existingUser = await UserModel.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      updateFields.username = username;
    }

    // Email validation
    if (email) {
      email = email.trim().toLowerCase();
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const existingEmailUser = await UserModel.findOne({ email, _id: { $ne: id } });
      if (existingEmailUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      updateFields.email = email;
    }

    // Mobile number check
    if (mobile) {
      const existingMobileUser = await UserModel.findOne({ mobile, _id: { $ne: id } });
      if (existingMobileUser) {
        return res.status(400).json({ message: "Mobile number is already in use" });
      }
      updateFields.mobile = mobile;
    }

    // Avatar size check
    if (avatar && avatar.trim() !== '') {
      const base64Str = avatar.split(',')[1] || avatar; // Remove data:image/...;base64,
      const sizeInBytes = (base64Str.length * 3) / 4;

      const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB

      if (sizeInBytes > MAX_IMAGE_SIZE) {
        return res.status(400).json({ message: "Image size exceeds 1MB limit" });
      }

      updateFields.avatar = avatar;
    }

    if (bio) updateFields.bio = bio;
    if (gender) updateFields.gender = gender;
    if (age) updateFields.age = age;

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};


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



export const GetUserById = async (req, res) => {
  try {
    // const email = req.query.email?.toLowerCase(); 
    const id = req.query.id; 
    // console.log(id);
    

    if (!id) {
      return res.status(400).json({ success: false, message: "User Id required" });
    }

    const user = await UserModel.findById(id);

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
      notifNo: user.friendRequests.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const calculateDailyStreak = (entries) => {
  if (!entries || entries.length === 0) {
    return 0;
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  let streak = 0;
  let lastActivityDate = null;

  for (let i = 0; i < sortedEntries.length; i++) {
    const currentActivityFullDate = sortedEntries[i].createdAt;
    const currentActivityDate = new Date(currentActivityFullDate.getFullYear(), currentActivityFullDate.getMonth(), currentActivityFullDate.getDate());

    if (!lastActivityDate) {
      streak = 1;
    } else {
      const timeDiff = currentActivityDate.getTime() - lastActivityDate.getTime();
      const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        streak++;
      } else if (dayDiff > 1) {
        streak = 1;
      }
    }
    lastActivityDate = currentActivityDate;
  }

  const today = new Date();
  const lastEntryDateOnly = new Date(lastActivityDate.getFullYear(), lastActivityDate.getMonth(), lastActivityDate.getDate());
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

  if (lastEntryDateOnly.getTime() !== todayDateOnly.getTime() && lastEntryDateOnly.getTime() !== yesterdayDateOnly.getTime()) {
      return 0;
  }

  return streak;
};


export const GetDashboardData = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "User ID required" });
    }

    const user = await UserModel.findById(id).populate('friends').populate('friendRequests.from', 'username name avatar');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [diaryEntries, calendarNotes, chatMessages] = await Promise.all([
      DiaryModel.find({ userId: id }).sort({ createdAt: 1 }),
      CalendarNoteModel.find({ userId: id }).sort({ createdAt: 1 }),
      ChatMessageModel.find({ $or: [{ senderId: id }, { recipientId: id }] })
        .sort({ createdAt: -1 })
        .populate('senderId', 'username name')
        .populate('receiverId', 'username name')
    ]);

    const today = new Date().toISOString().split('T')[0];

    const lastDiary = diaryEntries.length > 0 ? diaryEntries[diaryEntries.length - 1] : null;

    const todayNote = calendarNotes.find(n => {
      const noteDate = n.date instanceof Date ? n.date.toISOString().split('T')[0] : n.date;
      return noteDate === today;
    });

    const totalMessagesToday = chatMessages.filter(msg => {
      const messageDate = new Date(msg.createdAt).toISOString().split('T')[0];
      return messageDate === today;
    }).length;

    let topContact = 'N/A';
    let lastMessage = null;

    if (chatMessages.length > 0) {
      const messageCounts = {};
      chatMessages.forEach(msg => {
        let contactId = null;
        if (msg.senderId && msg.senderId._id.toString() !== user._id.toString()) {
          contactId = msg.senderId._id.toString();
        } else if (msg.recipientId && msg.recipientId._id.toString() !== user._id.toString()) {
          contactId = msg.recipientId._id.toString();
        }

        if (contactId) {
          messageCounts[contactId] = (messageCounts[contactId] || 0) + 1;
        }
      });

      let maxCount = 0;
      let topContactId = null;
      for (const contactId in messageCounts) {
        if (messageCounts[contactId] > maxCount) {
          maxCount = messageCounts[contactId];
          topContactId = contactId;
        }
      }

      if (topContactId) {
        const topUser = chatMessages.find(msg =>
          (msg.senderId && msg.senderId._id.toString() === topContactId) ||
          (msg.recipientId && msg.recipientId._id.toString() === topContactId)
        );
        topContact = topUser ? (topUser.senderId && topUser.senderId._id.toString() === topContactId ? topUser.senderId.username || topUser.senderId.name : topUser.recipientId.username || topUser.recipientId.name) : 'Unknown User';
      }

      const mostRecentMessage = chatMessages[0];
      if (mostRecentMessage) {
        let messageText = mostRecentMessage.content;
        let messageTime = new Date(mostRecentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (mostRecentMessage.senderId && mostRecentMessage.senderId._id.toString() === user._id.toString()) {
            messageText = `You: ${messageText}`;
        } else if (mostRecentMessage.senderId) {
            messageText = `${mostRecentMessage.senderId.username || mostRecentMessage.senderId.name}: ${messageText}`;
        }

        lastMessage = {
          text: messageText,
          time: messageTime
        };
      }
    }


    res.json({
      profile: {
        name: user.name,
        username: user.username,
        email: user.email,
        gender: user.gender,
        bio: user.bio,
        avatar: user.avatar,
        age: user.age
      },
      friends: {
        total: user.friends.length,
        streak: 0,
        pending: user.friendRequests.length
      },
      diary: {
        total: diaryEntries.length,
        lastEntry: lastDiary ? lastDiary.createdAt.toISOString().split('T')[0] : 'N/A',
        streak: calculateDailyStreak(diaryEntries)
      },
      notes: {
        total: calendarNotes.length,
        todayNote: todayNote ? todayNote.note : null,
        streak: calculateDailyStreak(calendarNotes)
      },
      chats: {
        totalMessagesToday: totalMessagesToday,
        topContact: topContact,
        media: {
          images: chatMessages.filter(m => m.messageType === 'image').length,
          audio: chatMessages.filter(m => m.messageType === 'audio').length
        },
        lastMessage: lastMessage
      },
      stats: {
        loginStreak: user.loginStreak,
        badges: ['Daily Starter', 'Friend Maker']
      }
    });
  } catch (err) {
    console.error('Error in GetDashboardData:', err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};
