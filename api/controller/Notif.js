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

    // Check if already sent
    const alreadySent = receiver.friendRequests.some(
      (r) => r.from.toString() === senderId
    );
    if (alreadySent) {
      return res.status(409).json({ message: 'Request already sent' });
    }

    // Check if already friends
    if (receiver.friends.includes(senderId)) {
      return res.status(409).json({ message: 'User is already your friend' });
    }

    // Add request
    receiver.friendRequests.push({ from: senderId });
    await receiver.save();

    res.status(200).json({ success: true, message: 'Request sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending request' });
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
