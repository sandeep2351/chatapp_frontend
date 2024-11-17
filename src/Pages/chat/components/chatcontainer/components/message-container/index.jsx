import React, { useEffect, useRef, useState } from "react";
import { useAppstore } from "@/store";
import moment from "moment";
import apiclient from "@/lib/api-client";
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES_ROUTE, HOST } from "@/utils/constants";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";

const MessageContainer = () => {
  const scrollref = useRef(null);

  const {
    selectedChatMessages,
    selectedChatType,
    selectedChatData,
    setSelectedChatMessages,
    setisDownloading,
    setfileDownloadProgress,
  } = useAppstore();

  const [showImage, setShowImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await apiclient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    const getchannelMessages=async()=>{
      try {
        const response = await apiclient.get(
          `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    } 
    if (selectedChatData._id && selectedChatType === "contact") {
      getMessage();
    }else if(selectedChatType==="channel"){
      getchannelMessages()
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollref.current) {
      scrollref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const downloadFile = async (url) => {
    setisDownloading(true);
    setfileDownloadProgress(0);
    const response = await apiclient.get(`${HOST}${url}`, {
      responseType: "blob",
      onDownloadProgress:(progressEvent)=>{
        const{loaded,total}=progressEvent;
        const percentcompleted=Math.round((loaded*100)/total);
        setfileDownloadProgress(percentcompleted);
      }
    });
    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setisDownloading(false);
    setfileDownloadProgress(0);
  };

  const renderMessages = () => {
    let lastdate = null;

    return selectedChatMessages.map((message, index) => {
      const messagedate = moment(message?.timestamp).format("YYYY-MM-DD");
      const showdate = messagedate !== lastdate;
      lastdate = messagedate;

      return (
        <div key={index}>
          {showdate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message?.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType==="channel " && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const renderDMMessages = (message) => {
    const senderId = message?.sender?.id;
    const selectedChatId = selectedChatData?._id;
    const fileUrl = message?.fileUrl;

    return (
      <div
        className={`${
          senderId === selectedChatId ? "text-left" : "text-right"
        }`}
      >
        {message?.messageType === "text" && (
          <div
            className={`${
              senderId !== selectedChatId
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-2 rounded my-1 max-w-[50%] break-words`}
          >
            {message?.content || "No content available"}
          </div>
        )}
        {message?.messageType === "file" && (
          <div
            className={`${
              senderId !== selectedChatId
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-2 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(fileUrl);
                }}
              >
                <img
                  src={`${HOST}${fileUrl}`}
                  height={300}
                  width={200}
                  alt="Message Attachment"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        <div className="text-xs text-gray-600 mb-4">
          {moment(message?.timestamp).format("LT")}
        </div>
      </div>
    );
  };


const  renderChannelMessages=(message)=>{
  return(
    <div className={`mt-5  ${message.sender._id !== userInfo.id ?"text-left":"text-right"} `}>
      {message?.messageType === "text" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-2 rounded my-1 max-w-[50%] break-words ml-9`}
          >
            {message?.content || "No content available"}
          </div>
        )}
        {message?.messageType === "file" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-2 rounded my-1 max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageUrl(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}${message.fileUrl}`}
                  height={300}
                  width={200}
                  alt="Message Attachment"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span>{fileUrl.split("/").pop()}</span>
                <span
                  className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        {
          message.sender._id!== userInfo.id ? <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                {message.sender.image && (
                  <AvatarImage
                    src={`${HOST}/${message.sender.image}`}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                )}
                  <AvatarFallback
                    className={`uppercase h-8 w-8 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                      message.sender.color
                    )}`}
                  >
                    {message.sender.firstName ? message.sender.firstName.charAt(0): message.sender.email.charAt(0)}
                  </AvatarFallback>
              </Avatar>
              <span className="text-sm text-white/60 ">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
              <span className="text-xs text-white/60">{moment(message.timestamp).format("LT")}</span>
          </div>:<div className="text-xs text-white/60 mt-1">{moment(message.timestamp).format("LT")}</div>
        }
    </div>
  )
}
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessages()}
      <div ref={scrollref}></div>
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div>
            <img
              src={`${HOST}${imageUrl}`}
              className="h-[80vh] w-full bg-cover mt-10"
              alt="Expanded Image"
            />
          </div>
          <div className="flex gap-5 top-0 fixed mt-5">
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageUrl)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageUrl(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
