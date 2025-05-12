
import {UserModel} from "../Model/UserModel.js"
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
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


