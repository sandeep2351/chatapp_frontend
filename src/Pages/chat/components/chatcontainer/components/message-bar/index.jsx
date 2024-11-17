import { useSocket } from "@/context/SocketContext";
import apiclient from "@/lib/api-client";
import { useAppstore } from "@/store";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

const MessageBar = () => {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const Socket = useSocket();

  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setisUploading,
    setfileUploadProgress,

  } = useAppstore();
  const [message, setMessage] = useState("");
  const [emojiPicker, setEmojiPicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
    setEmojiPicker(false); // Close picker after selection
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return; // Prevent sending empty message

    if (selectedChatType === "contact") {
      Socket.emit("sendMessage", {
        sender: userInfo,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
      setMessage(""); // Clear the message input after sending
    }
    else if(selectedChatType==="channel"){
      Socket.emit("send-channel-message",{
        sender: userInfo,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId:selectedChatData._id,
      })
    }
    setMessage("");
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file); // Ensure the key matches 'file'
        setisUploading(true);
        const response = await apiclient.post(UPLOAD_FILE_ROUTE, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress:data=>{
            setfileUploadProgress(Math.round((100*data.loaded)/data.total));
          }
        });

        if (response.status === 200 && response.data) {
          setisUploading(false);
          if (selectedChatType === "contact") {
            Socket.emit("sendMessage", {
              sender: userInfo,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: response.data.filePath,
            });
          }else if(selectedChatType==="channel"){
            Socket.emit("send-channel-message",{
              sender: userInfo,
              content: undefined,
              messageType: "file",
              fileUrl: response.data.filePath,
              channelId:selectedChatData._id,
            })
          }
        }
      }
    } catch (error) {
      setisUploading(false);
      console.log({ error });
    }
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-3 bg-transparent rounded-md focus:border-none focus:outline-none"
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="text-neutral-500 hover:text-white transition-all duration-300"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-1xl" />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            className="text-neutral-500 hover:text-white transition-all duration-300"
            onClick={() => setEmojiPicker(true)}
          >
            <RiEmojiStickerLine className="text-1xl" />
          </button>
          {emojiPicker && (
            <div className="absolute bottom-16 right-0" ref={emojiRef}>
              <EmojiPicker
                theme="dark"
                onEmojiClick={handleEmoji}
                autoFocusSearch={false}
              />
            </div>
          )}
        </div>
      </div>
      <button
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-4 hover:bg-[#741bda] transition-all duration-300"
        onClick={handleSendMessage}
      >
        <IoSend className="text-1xl" />
      </button>
    </div>
  );
};

export default MessageBar;
