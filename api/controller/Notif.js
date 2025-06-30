

// import { UserModel } from "../Model/UserModel.js";


// export const sendFriendRequest = async (req, res) => {
//   const { senderId, receiverId } = req.body;

//   if (!senderId || !receiverId) {
//     return res.status(400).json({ message: "Missing IDs" });
//   }
//   if (senderId === receiverId) {
//     return res.status(400).json({ message: "Cannot send request to yourself" });
//   }

//   try {
//     const receiver = await UserModel.findById(receiverId);
//     if (!receiver) {
//       return res.status(404).json({ message: "Receiver user not found" });
//     }

//     const friendRequests = receiver.friendRequests || [];
//     const alreadySent = friendRequests.some(
//       (r) => r.from.toString() === senderId
//     );
//     if (alreadySent) {
//       return res.status(409).json({ message: "Request already sent" });
//     }

//     const friends = receiver.friends || [];
//     if (friends.includes(senderId)) {
//       return res.status(409).json({ message: "User is already your friend" });
//     }

//     receiver.friendRequests.push({ from: senderId });
//     await receiver.save();

//     res.status(200).json({ success: true, message: "Request sent" });
//   } catch (err) {
//     console.error("Error sending request:", err);
//     res.status(500).json({ message: "Error sending request" });
//   }
// };


// export const getFriendRequests = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const user = await UserModel.findById(userId).populate(
//       "friendRequests.from",
//       "fullname avatar email"
//     );
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ success: true, requests: user.friendRequests });
//   } catch (err) {
//     console.error("Error fetching friend requests:", err);
//     res.status(500).json({ message: "Error fetching requests" });
//   }
// };


// export const respondToRequest = async (req, res) => {
//   const { userId, senderId, action } = req.body;

//   if (!userId || !senderId || !action) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   try {
//     const user = await UserModel.findById(userId);
//     const sender = await UserModel.findById(senderId);

//     if (!user || !sender) {
//       return res.status(404).json({ message: "User or sender not found" });
//     }

 
//     if (action === "accept") {
//       if ((user.friends || []).length >= 1) {
//         return res.status(400).json({ message: `${user.fullname} cannot have more than one friend.` });
//       }
//       if ((sender.friends || []).length >= 1) {
//         return res.status(400).json({ message: `${sender.fullname} cannot have more than one friend.` });
//       }
//     }

    
//     user.friendRequests = (user.friendRequests || []).filter(
//       (r) => r.from.toString() !== senderId
//     );

//     if (action === "accept") {
//       if (!user.friends.includes(senderId)) user.friends.push(senderId);
//       if (!sender.friends.includes(userId)) sender.friends.push(userId);
//       await sender.save();
//     }

//     await user.save();

//     res.json({ success: true, message: `Request ${action}ed` });
//   } catch (err) {
//     console.error("Error responding to request:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// export const GetFriendNotif = async (req, res) => {
//   try {
//     const email = req.query.email?.toLowerCase();

//     if (!email) {
//       return res.status(400).json({ success: false, message: "Email required" });
//     }

//     const user = await UserModel.findOne({ email }).populate({
//       path: "friendRequests.from",
//       select: "name avatar email",
//     });

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

   
    
//     res.json({
//       success: true,
//       pendingRequests: user.friendRequests,
//     });
//   } catch (err) {
//     console.error("Error in GetFriendNotif:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

import { UserModel } from "../Model/UserModel.js";

// Existing sendFriendRequest remains the same

export const sendFriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "Missing IDs" });
  }
  if (senderId === receiverId) {
    return res.status(400).json({ message: "Cannot send request to yourself" });
  }

  try {
    const receiver = await UserModel.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    const friendRequests = receiver.friendRequests || [];
    const alreadySent = friendRequests.some(
      (r) => r.from.toString() === senderId
    );
    if (alreadySent) {
      return res.status(409).json({ message: "Request already sent" });
    }

    const friends = receiver.friends || [];
    if (friends.includes(senderId)) {
      return res.status(409).json({ message: "User is already your friend" });
    }

    receiver.friendRequests.push({ from: senderId });
    await receiver.save();

    res.status(200).json({ success: true, message: "Request sent" });
  } catch (err) {
    console.error("Error sending request:", err);
    res.status(500).json({ message: "Error sending request" });
  }
};


// Existing getFriendRequests remains the same (though it's not used by NotificationScreen directly)
export const getFriendRequests = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId).populate(
      "friendRequests.from",
      "fullname avatar email"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, requests: user.friendRequests });
  } catch (err) {
    console.error("Error fetching friend requests:", err);
    res.status(500).json({ message: "Error fetching requests" });
  }
};


// Existing respondToRequest remains the same (for accepting/rejecting friend requests)
export const respondToRequest = async (req, res) => {
  const { userId, senderId, action } = req.body;

  if (!userId || !senderId || !action) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await UserModel.findById(userId);
    const sender = await UserModel.findById(senderId);

    if (!user || !sender) {
      return res.status(404).json({ message: "User or sender not found" });
    }

    // Limit friends to one
    if (action === "accept") {
      if ((user.friends || []).length >= 1) {
        return res.status(400).json({ message: `${user.name} cannot have more than one friend.` }); // Use name instead of fullname
      }
      if ((sender.friends || []).length >= 1) {
        return res.status(400).json({ message: `${sender.name} cannot have more than one friend.` }); // Use name
      }
    }

    // Filter out the specific friend request
    user.friendRequests = (user.friendRequests || []).filter(
      (r) => r.from.toString() !== senderId
    );

    if (action === "accept") {
      if (!user.friends.includes(senderId)) user.friends.push(senderId);
      if (!sender.friends.includes(userId)) sender.friends.push(userId);
      await sender.save();
    }

    await user.save();

    res.json({ success: true, message: `Friend request ${action}ed` }); // More specific message
  } catch (err) {
    console.error("Error responding to request:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// --- NEW BACKEND LOGIC FOR UNFRIEND REQUESTS ---

// Controller to send an unfriend request
export const sendUnfriendRequest = async (req, res) => {
  const { senderId, receiverId } = req.body; // senderId is the one who initiates unfriend, receiverId is the friend who receives the request

  if (!senderId || !receiverId) {
    return res.status(400).json({ message: "Missing sender or receiver ID" });
  }

  if (senderId === receiverId) {
    return res.status(400).json({ message: "Cannot unfriend yourself" });
  }

  try {
    const sender = await UserModel.findById(senderId); // The user sending the unfriend request
    const receiver = await UserModel.findById(receiverId); // The friend who will receive the notification

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver user not found" });
    }

    // Check if they are actually friends
    if (!sender.friends.includes(receiverId) || !receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "Users are not friends to begin with" });
    }

    // Check if an unfriend request is already pending from sender to receiver
    const unfriendRequests = receiver.unfriendRequests || [];
    const alreadySent = unfriendRequests.some(
      (r) => r.from.toString() === senderId
    );
    if (alreadySent) {
      return res.status(409).json({ message: "Unfriend request already sent to this user" });
    }

    // Add unfriend request to the receiver's unfriendRequests array
    receiver.unfriendRequests.push({ from: senderId });
    await receiver.save();

    res.status(200).json({ success: true, message: "Unfriend request sent successfully" });
  } catch (err) {
    console.error("Error sending unfriend request:", err);
    res.status(500).json({ message: "Error sending unfriend request" });
  }
};



export const respondToUnfriendRequest = async (req, res) => {
  const { userId, senderId, action } = req.body; 
  if (!userId || !senderId || !action) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await UserModel.findById(userId); 
    const sender = await UserModel.findById(senderId); 

    if (!user || !sender) {
      return res.status(404).json({ message: "User or sender not found" });
    }

    
    user.unfriendRequests = (user.unfriendRequests || []).filter(
      (r) => r.from.toString() !== senderId
    );

    if (action === "agree") {
     
      if (user.friends.includes(senderId) && sender.friends.includes(userId)) {
        
        user.friends = user.friends.filter(friendId => friendId.toString() !== senderId);
        sender.friends = sender.friends.filter(friendId => friendId.toString() !== userId);

        await sender.save();
        await user.save();
        res.json({ success: true, message: "Successfully unfriended" });
      } else {
       
        await user.save();
        res.status(200).json({ success: true, message: "Not friends, unfriend request cleared." });
      }
    } else if (action === "cancel") {
      await user.save();
      res.json({ success: true, message: "Unfriend request cancelled." });
    } else {
      return res.status(400).json({ message: "Invalid action for unfriend request" });
    }

  } catch (err) {
    console.error("Error responding to unfriend request:", err);
    res.status(500).json({ message: "Server error" });
  }
};



export const GetFriendNotif = async (req, res) => {
  try {
    const email = req.query.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const user = await UserModel.findOne({ email })
      .populate({
        path: "friendRequests.from",
        select: "name avatar email",
      })
      .populate({ // NEW POPULATE FOR UNFRIEND REQUESTS
        path: "unfriendRequests.from",
        select: "name avatar email",
      });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      friendRequests: user.friendRequests, // Renamed from pendingRequests for clarity
      unfriendRequests: user.unfriendRequests, // NEW
    });
  } catch (err) {
    console.error("Error in GetFriendNotif:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
