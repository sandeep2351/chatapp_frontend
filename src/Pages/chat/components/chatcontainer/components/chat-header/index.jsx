import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppstore } from "@/store";
import React from "react";
import { RiCloseFill } from "react-icons/ri";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppstore();
  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center justify-center -ml-10">
          <div className="w-12 h-12 relative">
            {selectedChatType === "channel" ? ( // Show # for channels
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            ) : (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0"> {/* Show profile for contacts */}
                {selectedChatData?.image ? (
                  <AvatarImage
                    src={`${HOST}/${selectedChatData.image}`}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                      selectedChatData?.color
                    )}`}
                  >
                    {selectedChatData?.firstname
                      ? selectedChatData.firstname.charAt(0)
                      : selectedChatData?.email?.charAt(0) || "?"}
                  </div>
                )}
              </Avatar>
            )}
          </div>
          <div>
            {selectedChatType === "channel" && selectedChatData.name} {/* Show name for channel */}
            {selectedChatType === "contact" && selectedChatData.firstName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : selectedChatData.email} {/* Show name or email for contact */}
          </div>
        </div>
        <div className="flex items-center gap-5 justify-center">
          <button
            className="text-neutral-500 hover:text-white focus:text-white focus:outline-none transition-all duration-300"
            onClick={closeChat}
          >
            <RiCloseFill className="text-3xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
