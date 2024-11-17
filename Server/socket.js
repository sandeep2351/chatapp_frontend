const { Server: socketioserver } = require("socket.io");
const mongoose = require("mongoose");
const Messages = require("./models/MessagesModel"); // Default import
const { default: Channel } = require("./models/Channelmodel");
const { findById } = require("./models/Usermodel");

const setupServer = (server) => {
  const io = new socketioserver(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const usersocketmap = new Map();

  const disconnect = (socket) => {
    console.log("User disconnected");
    for (const [userId, socketId] of usersocketmap.entries()) {
      if (socketId === socket.id) {
        usersocketmap.delete(userId);
        console.log(`Removed user ${userId} from usersocketmap`);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    console.log("Received message:", message);

    const senderId = message.sender.id || message.sender;
    const recipientId = message.recipient.id || message.recipient;

    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(recipientId)
    ) {
      console.error("Invalid sender or recipient ID");
      return;
    }

    const senderSocketId = usersocketmap.get(senderId);
    const recipientSocketId = usersocketmap.get(recipientId);

    try {
      const createdMessage = await Messages.create({
        sender: senderId,
        recipient: recipientId,
        messageType: message.messageType,
        content: message.content,
        fileUrl: message.fileUrl,
        TimeStamp: message.TimeStamp || new Date(),
      });

      const messageData = await Messages.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;
    const createdMessage = await message.create({
      sender,
      recipient: null,
      content,
      messageType,
      TimeStamp: new Date(),
      fileUrl,
    });

    const messageData = await Messages.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

      await Channel.findByIdAndUpdate(channelId,{
        $push:{messages:createdMessage._id},
      })

      const channel=(await Channel.findById(channelId)).populated("members");

      const finaldata={...messageData._doc,channelId:channel._id}

      if(channel && channel.members){
        channel.members.forEach((members)=>{
            const membersocketId=usersocketmap.get(member._id,toString());
            if(membersocketId){
                io.to(membersocketId).emit('recieve-channel-message',finaldata);
            }
           
        });
        const adminsocketId=usersocketmap.get(channel.admin._id,toString());
        if(adminsocketId){
            io.to(adminsocketId).emit('recieve-channel-message',finaldata);
        }
      }
  };
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      usersocketmap.set(userId, socket.id);
      console.log(`User connected ${userId} with socketId ${socket.id}`);
    } else {
      console.log("User ID is not provided");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("disconnect", () => disconnect(socket));
  });

  return Promise.resolve();
};

module.exports = { setupServer };
