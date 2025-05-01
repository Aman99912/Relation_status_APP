// // Forgot Password: Step 1 - Send OTP
// export const forgotPassword = async (req, res) => {
//     const { email } = req.body;
  
//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }
  
//     const user = await UserModel.findOne({ email });
  
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
  
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiration time
  
//     otpStore[email] = { otp, expiresAt }; // Store OTP in memory temporarily
  
//     try {
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_ID,
//           pass: process.env.EMAIL_PASS,
//         },
//       });
  
//       await transporter.sendMail({
//         from: process.env.EMAIL_ID,
//         to: email,
//         subject: "Password Reset OTP",
//         text: `Your OTP for password reset is: ${otp}`,
//       });
  
//       res.status(200).json({ message: "OTP sent successfully" });
//     } catch (error) {
//       console.error("Error sending OTP:", error.message); // Log error for debugging
//       res.status(500).json({ message: "OTP sending failed", error: error.message });
//     }
//   };
  
 
//   export const verifyPasswordOtp = async (req, res) => {
//     const { email, otp } = req.body;
  
//     if (!email || !otp) {
//       return res.status(400).json({ message: "Email and OTP are required." });
//     }
  
//     const storedOtp = otpStore[email]; // Retrieve OTP from memory
  
//     if (!storedOtp) {
//       return res.status(400).json({ message: "No OTP found for this email." });
//     }
  
//     if (storedOtp.otp !== otp) {
//       return res.status(400).json({ message: "Invalid OTP." });
//     }
  
//     if (Date.now() > storedOtp.expiresAt) {
//       delete otpStore[email]; // Clear expired OTP
//       return res.status(400).json({ message: "OTP expired." });
//     }
  
//     // OTP is valid
//     res.status(200).json({ message: "OTP verified successfully" });
//   };
  
  // Reset Password: Step 3 - Update Password
//   export const resetPassword = async (req, res) => {
//     const { email, newPassword } = req.body;
  
//     if (!email || !newPassword) {
//       return res.status(400).json({ message: "Email and new password are required." });
//     }
  
//     const user = await UserModel.findOne({ email });
  
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
  
//     // Hash the new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
  
//     try {
//       user.password = hashedPassword;
//       await user.save(); // Save updated password to the database
  
//       res.status(200).json({ message: "Password reset successful" });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };
  
export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
  
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }
  
    const user = await UserModel.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    try {
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log('Hashed Password:', hashedPassword);
  
      user.password = hashedPassword;
      await user.save(); 
  
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error during password reset:", error.message); 
      res.status(500).json({ message: error.message });
    }
  };
  
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    const user = await UserModel.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiration time
  
    otpStore[email] = { otp, expiresAt }; 
    console.log("OTP Sent:", otp); 
  
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
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}`,
      });
  
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error.message); // Log error for debugging
      res.status(500).json({ message: "OTP sending failed", error: error.message });
    }
  };
  
  export const verifyPasswordOtp = async (req, res) => {
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
    res.status(200).json({ message: "OTP verified successfully" });
  };
  