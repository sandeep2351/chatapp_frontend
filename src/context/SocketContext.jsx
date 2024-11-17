import { useAppstore } from "@/store";
import { HOST } from "@/utils/constants";
import { useContext, createContext, useRef, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const useSocket = () => {
  return useContext(SocketContext);
};

const SocketProvider = ({ children }) => {
  const socket = useRef(null); 
  const { userInfo } = useAppstore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });

      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      const handleReceiveMessage = (message) => {
        const { selectedChatType, selectedChatData, addMessage,addContactsinDMcontacts } = useAppstore.getState();

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
           selectedChatData._id === message.recipient._id)
        ) {
          console.log("Message received:", message);
          addMessage(message);
        }
        addContactsinDMcontacts(message);
      };

      const handleRecievechannelMessage=(message)=>{
        const { selectedChatType, selectedChatData, addMessage ,addChannelInChannelList} = useAppstore.getState();

        if(selectedChatType !== undefined && selectedChatData._id ===message.channelId){
          addMessage(message);
        }
        addChannelInChannelList(message);
      }

      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("recieve-channel-message",handleRecievechannelMessage);

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
