
import { log } from "console";
import { UserModel } from "../Model/UserModel.js";

export const sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: 'Missing IDs' });
  }
  if (senderId === receiverId) {
    return res.status(400).json({ message: 'Cannot send request to yourself' });
  }

  try {
    const receiver = await UserModel.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver user not found' });
    }

    // Defensive: Ensure friendRequests array exists
    const friendRequests = receiver.friendRequests || [];

    // Check if already sent
    const alreadySent = friendRequests.some(
      (r) => r.from.toString() === senderId
    );
    if (alreadySent) {
      return res.status(409).json({ message: 'Request already sent' });
   
    }

    // Defensive: Ensure friends array exists
    const friends = receiver.friends || [];

    // Check if already friends
    if (friends.includes(senderId)) {
      return res.status(409).json({ message: 'User is already your friend' });
    }

    // Add request
    receiver.friendRequests.push({ from: senderId });
    await receiver.save();

    res.status(200).json({ success: true, message: 'Request sent' });
 
  } catch (err) {
    console.error('Error sending request:', err);
    res.status(500).json({ message: 'Error sending request' });
  }
};

export const getFriendRequests = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId).populate('friendRequests.from', 'username avatar');
    if (!user)
      return res.status(404).json({ message: 'User not found' });
    res.json({ requests: user.friendRequests });
  } catch (err) {
    console.error('Error fetching friend requests:', err);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};


export const respondToRequest = async (req, res) => {
  const { userId, senderId, action } = req.body;

  console.log("User Id:", userId);
  console.log("Sender Id:", senderId);

  if (!userId || !senderId || !action) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await UserModel.findById(userId);
    const sender = await UserModel.findById(senderId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!sender) return res.status(404).json({ message: 'Sender not found' });

    const userFriends = user.friends || [];
    const senderFriends = sender.friends || [];

    // ❌ If either user already has one or more friends
    if (action === 'accept' && (userFriends.length >= 1 || senderFriends.length >= 1)) {
      return res.status(400).json({ message: 'You can only have one friend' });
    }

    // ✅ Remove the friend request from user's friendRequests
    user.friendRequests = (user.friendRequests || []).filter(
      (req) => req.from.toString() !== senderId
    );

    if (action === 'accept') {
      if (!userFriends.includes(senderId)) {
        user.friends.push(senderId);
      }

      if (!senderFriends.includes(userId)) {
        sender.friends.push(userId);
        await sender.save();
      }
    }

    await user.save();

    return res.json({ success: true, message: `Request ${action}ed ` });
  } catch (error) {
    console.error('Error in respondToRequest:', error);
    return res.status(500).json({ message: 'Server error' });
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
      select: 'name avatar email', // Select only required fields
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
    console.error('Error in GetFriendNotif:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
