const mongoose = require('mongoose');
const User = require('../models/Usermodel');
const Message = require('../models/MessagesModel');

// Search contacts based on the search term
const searchcontacts = async (req, res) => {
    try {
        const { searchterm } = req.body;

        if (!searchterm) {
            return res.status(400).send("searchterm is required");
        }

        // Sanitize the search term to prevent regex injection
        const sanitizedSearchTerm = searchterm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(sanitizedSearchTerm, "i");

        // Search for users excluding the current user
        const contacts = await User.find({
            _id: { $ne: req.userId },
            $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        });

        return res.json({ contacts });

    } catch (error) {
        console.error("Error during contact search:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get contacts for direct messages list
const getContactfordmlist = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).send("User ID is required");
        }

        // Correctly use mongoose.Types.ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);


        // Aggregate messages to find contacts with the latest messages
        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userObjectId },
                        { recipient: userObjectId }
                    ],
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userObjectId] },
                            then: "$recipient",
                            else: "$sender",
                        }
                    },
                    lastMessageTime: { $first: "$timestamp" },
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfo",
                }
            },
            {
                $unwind: "$contactInfo",
            },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    email: "$contactInfo.email",
                    firstName: "$contactInfo.firstName",
                    lastName: "$contactInfo.lastName",
                    color: "$contactInfo.color",
                    image: "$contactInfo.image",
                }
            },
            {
                $sort: { lastMessageTime: -1 },
            },
        ]);

        return res.json({ contacts });

    } catch (error) {
        console.error("Error during contact search:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


const getAllContacts= async (request, response) => {
    try {
        const users=await User.find({_id:{$ne:request.userId}},"firstName lastName _id email");

        const contacts=users.map((user)=>({
            label:user.firstName ? `${user.firstName} ${user.lastName}`: user.email,
            value:user._id
        }))

        return response.json({ contacts });

    } catch (error) {
        console.error("Error during contact search:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { searchcontacts, getContactfordmlist,getAllContacts };
