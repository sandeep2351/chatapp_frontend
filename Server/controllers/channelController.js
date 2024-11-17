const { default: mongoose } = require("mongoose");
const Channel = require("../models/Channelmodel");
const User = require("../models/Usermodel");
const { default: channel } = require("../models/Channelmodel");

const createchannel = async (request, response) => {
  try {
    const { name, members } = request.body;
    const userId = request.userId;
    const admin = await User.findById(userId);

    if (!admin) {
      response.status(400).send("Admin user not found");
    }

    const validmembers = await User.find({ _id: { $in: members } });
    if (validmembers.length !== members.length) {
      return response.status(400).send("some members are not valid users");
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();
    return response.status(201).json({ channel: newChannel });
  } catch (error) {
    console.error("Error during logout:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
};

const getuserchannels = async (request, response) => {
  try {
    const userId = new mongoose.Types.ObjectId(request.userId);
    const channels = await channel
      .find({
        $or: [{ admin: userId }, { members: userId }],
      })
      .sort({ updatedAt: -1 });

    return response.status(201).json({ channels });
  } catch (error) {
    console.error("Error during logout:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
};

const getchannelmessages = async (request, response) => {
  try {
    const { ChannelId } = request.params;
    const Channel = (await channel.findById(ChannelId)).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });
    if(!Channel){
        return response.status(404).send("channel not found");
    }
    const messages=Channel.messages;
    return response.status(201).json({messages});
  } catch (error) {
    return response.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = { createchannel, getuserchannels, getchannelmessages };
