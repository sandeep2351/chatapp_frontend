// routes/messageRoutes.js
const { Router } = require("express");
const { getMessages, uploadfile } = require("../controllers/MessagesController");
const { verifytoken } = require("../middlewares/Authmiddleware");
const multer = require("multer");

const messageRoutes = Router();

const upload=multer({dest:"uploads/files"})
messageRoutes.post("/get-messages", verifytoken, getMessages);
messageRoutes.post("/upload-file",verifytoken,upload.single("file"),uploadfile)

module.exports = { messageRoutes };
