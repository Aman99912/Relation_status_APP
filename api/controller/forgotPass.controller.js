
import {UserModel} from "../Model/UserModel.js"
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
dotenv.config()



export const SendForgotPass = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Email not registered' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

  user.otp = otp;
  user.otpExpire = expireTime;
  await user.save();

  // Send OTP via Email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP is: ${otp} \n Don't Share`
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      token: otp 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to send email' });
  }
};


export const verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check OTP and expiry
  if (user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (Date.now() > user.otpExpire) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  return res.status(200).json({ success: true, message: 'OTP verified successfully' });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashedPass = await bcrypt.hash(newPassword, 10);
  user.password = hashedPass;
  user.otp = null;
  user.otpExpire = null;
  await user.save();

  return res.status(200).json({ success: true, message: 'Password updated successfully' });
};





export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password); 
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid old password.' });
        }

        if (newPassword.length < 5) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully.' });

    } catch (error) {
        // console.error('Change Password Error:', error);
        res.status(500).json({ success: false, message: 'Server error while changing password.' });
    }
};

export const setSubPassword = async (req, res) => {
    try {
        const { userId, currentSubPassword, newSubPassword } = req.body;

        if (req.user.id !== userId) {
            return res.status(403).json({ message: 'Unauthorized access.' });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.SubPass) {
            if (user.SubPass !== currentSubPassword) {
                return res.status(400).json({ success: false, message: 'Invalid current sub-password.' });
            }
        } else if (currentSubPassword) {
            return res.status(400).json({ success: false, message: 'No current sub-password set. Please leave "Current Sub-Password" field blank to set a new one.' });
        }

        user.SubPass = newSubPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Sub-password updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while updating sub-password.' });
    }
};



export  const generateSubPassCode = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await UserModel.findById(userId);

    if (!user || !user.email) {
      return res.status(404).json({ success: false, message: 'User or email not found.' });
    }

    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    user.SubPass = newCode;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_ID,
      to: user.email,
      subject: 'Your Unique-Password Created',
      text: `Your  Unique-password is: ${newCode}`,
    });

    res.status(200).json({ success: true, message: 'Code sent successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send code.' });
  }
};
