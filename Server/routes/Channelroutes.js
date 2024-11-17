const { Router } = require("express");
const {
  createchannel,
  getuserchannels,
  getchannelmessages,
} = require("../controllers/channelController");  // Use relative path
const { verifytoken } = require("../middlewares/Authmiddleware");  // Use relative path

const channelroutes = Router();

channelroutes.post("/create-channel", verifytoken, createchannel);
channelroutes.get("/get-user-channel", verifytoken, getuserchannels);
channelroutes.get("/get-channel-messages/:channelId", verifytoken, getchannelmessages);

module.exports = { channelroutes };
