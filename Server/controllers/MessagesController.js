const Message = require("../models/MessagesModel"); // Use CommonJS 'require' for importing models
const fs = require('fs'); // Import filesystem module
const path = require('path'); // Import path module

// Controller to get messages between two users
const getMessages = async (request, response, next) => {
  try {
    const user1 = request.userId; // From the verified token in middleware
    const user2 = request.body.id || request.params.id; // Get user2 from the request body or params

    // Ensure both user IDs are present
    if (!user1 || !user2) {
      return response.status(400).json({ error: "Both user IDs are required" });
    }

    // Fetch messages between user1 and user2
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 }); // Sort by timestamp in ascending order

    // Return messages as a JSON response
    return response.json({ messages });
  } catch (error) {
    console.error("Error during message retrieval:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to handle file uploads
const uploadfile = async (request, response, next) => {
  try {
      if (!request.file) {
          console.log("No file received:", request.file);
          return response.status(400).send("File is required");
      }

      const date = Date.now();
      // Use 'files' instead of 'file'
      const uploadDir = path.join(__dirname, '../uploads/files', String(date));
      const fileName = path.join(uploadDir, request.file.originalname);

      console.log(`Upload Directory: ${uploadDir}`);
      console.log(`File Path: ${fileName}`);

      fs.mkdirSync(uploadDir, { recursive: true });
      fs.renameSync(request.file.path, fileName);

      return response.json({ filePath: `/uploads/files/${date}/${request.file.originalname}` });

  } catch (error) {
      console.error("Error during file upload:", error);
      return response.status(500).json({ error: "Internal Server Error" });
  }
};





// Export the controllers using module.exports
module.exports = { getMessages, uploadfile };
