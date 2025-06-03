// import { UserModel } from "../Model/UserModel.js";
// import mongoose from "mongoose"; // ✅ import for ObjectId check

// export const sendFriendRequest = async (req, res) => {
//   const { senderId, receiverId } = req.body;

//   if (!senderId || !receiverId) {
//     return res.status(400).json({ message: 'Missing IDs' });
//   }

//   if (senderId === receiverId) {
//     return res.status(400).json({ message: 'Cannot send request to yourself' });
//   }

//   // ✅ Check for valid ObjectId format
//   if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
//     return res.status(400).json({ message: 'Invalid sender or receiver ID format' });
//   }

//   try {
//     const receiver = await UserModel.findById(receiverId);
//     if (!receiver) {
//       return res.status(404).json({ message: 'Receiver user not found' });
//     }

//     const alreadySent = receiver.friendRequests.some(
//       (r) => r.from.toString() === senderId
//     );

//     if (alreadySent) {
//       return res.status(409).json({ message: 'Friend request already sent' });
//     }

//     const alreadyFriend = receiver.friends.includes(senderId);
//     if (alreadyFriend) {
//       return res.status(409).json({ message: 'User is already your friend' });
//     }

//     receiver.friendRequests.push({ from: senderId });
//     await receiver.save();

//     return res.status(200).json({ success: true, message: 'Friend request sent successfully' });

//   } catch (error) {
//     console.error('Friend Request Error:', error); // ⛳ log error for debugging
//     return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

import { UserModel } from "../Model/UserModel.js";
import mongoose from "mongoose";

export const sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: 'Missing IDs' });
  }

  if (senderId === receiverId) {
    return res.status(400).json({ message: 'Cannot send request to yourself' });
  }

  if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
    return res.status(400).json({ message: 'Invalid sender or receiver ID format' });
  }

  try {
    const receiver = await UserModel.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver user not found' });
    }

    const alreadySent = receiver.friendRequests.some(
      (r) => r.from.toString() === senderId
    );
    if (alreadySent) {
      return res.status(409).json({ message: 'Friend request already sent' });
    }

    const alreadyFriend = receiver.friends.includes(senderId);
    if (alreadyFriend) {
      return res.status(409).json({ message: 'User is already your friend' });
    }

    receiver.friendRequests.push({ from: senderId });
    await receiver.save();

    // ✅ Emit real-time notification to the receiver if online
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const receiverSocketId = connectedUsers.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('friendRequestNotification', {
        from: senderId,
        message: 'You received a new friend request!',
      });
    }

    return res.status(200).json({ success: true, message: 'Friend request sent successfully' });

  } catch (error) {
    console.error('Friend Request Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



export const getFriendRequests = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId).populate('friendRequests.from', 'username avatarUrl');
    if (!user)
      return res.status(404).json({ message: 'User not found' });
    res.json({ requests: user.friendRequests });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

export const respondToRequest = async (req, res) => {
  const { userId, senderId, action } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    // Remove the friend request
    user.friendRequests = user.friendRequests.filter(
      (r) => r.from.toString() !== senderId
    );

    if (action === 'accept') {
      if (!user.friends.includes(senderId)) user.friends.push(senderId);

      const sender = await UserModel.findById(senderId);
      if (sender && !sender.friends.includes(userId)) {
        sender.friends.push(userId);
        await sender.save();
      }
    }

    await user.save();

    res.json({ success: true, message: `Request ${action}ed` });
  } catch (err) {
    res.status(500).json({ message: 'Error responding to request' });
  }
};


export const GetFriendNotif = async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    // Find user and populate 'from' field inside friendRequests
    const user = await UserModel.findOne({ email }).populate({
      path: 'friendRequests.from',
      select: 'name  avatar email', // Select only required fields
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Return all pending friend requests (by default they are pending)
    res.json({
      success: true,
      pendingRequests: user.friendRequests, // Contains 'from' populated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
