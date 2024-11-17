import React from "react";
import { useAppstore } from "@/store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";

const Contactlist = ({ contacts = [], isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    selectedChatType,
    setSelectedChatMessages,
  } = useAppstore();

  const handleClick = (contact) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  return (
    <div className="mt-5">
      {contacts.length > 0 ? (
        contacts.map((contact) => {
          // Debugging: Log contact object
          console.log('Contact:', contact);

          return (
            <div
              key={contact._id}
              onClick={() => handleClick(contact)}
              className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
                selectedChatData && selectedChatData._id === contact._id
                  ? "bg-[#8417ff] hover-bg=[#8417ff] "
                  : "hover-bg-[#f1f1f111]"
              }`}
            >
              <div className="flex gap-5 items-center justify-start text-neutral-300">
                {!isChannel && (
                  <Avatar className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                    {contact.image ? (
                      <AvatarImage
                        src={`${HOST}/${contact.image}`}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`
                            ${selectedChatData && selectedChatData._id === contact._id ? "bg-[#ffffff22] border-white/70 border-2" :getColor(contact.color)}
                            uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                      >
                        {contact.firstName
                          ? contact.firstName.charAt(0)
                          : contact.email?.charAt(0) || "?"}
                      </div>
                    )}
                  </Avatar>
                )}
                {
                    isChannel && <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">#</div>
                }
                {
                    isChannel ? <span>{contact.name}</span>:<span>{contact.firstName ?`${contact.firstName} ${contact.lastName}`:contact.email}</span>
                }
              </div>
            </div>
          );
        })
      ) : (
        <div>No contacts found</div>
      )}
    </div>
  );
};

export default Contactlist;
