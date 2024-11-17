

export const createChatslice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading:false,
  isDownloading:false,
  fileUploadProgress:0,
  fileDownloadProgress:0,
  channel:[],
  setchannels:(channels)=>set({channels}),
  setisUploading:(isUploading)=>set({isUploading}),
  setisDownloading:(isDownloading)=>set({isDownloading}),
  setfileUploadProgress:(fileUploadProgress)=>({fileUploadProgress}),
  setfileDownloadProgress:(fileDownloadProgress)=>set({fileDownloadProgress}),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) =>set({directMessagesContacts}),
  addchannel:(channel)=>{
    const channels= get().channels;
    set({channels:[channel,...channels]})
  },
  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),

  addMessage: (message) => {
    const { selectedChatMessages, selectedChatType } = get();

    // Ensure that recipient and sender IDs are handled correctly
    const recipient =
      selectedChatType === "channel" ? message.recipient : message.recipient.id;
    const sender =
      selectedChatType === "channel" ? message.sender : message.sender.id;

    // Log incoming message and updated state
    console.log("Incoming message:", message);
    console.log("Current chat messages:", selectedChatMessages);

    // Update state with new message
    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient,
          sender,
        },
      ],
    });

    // Log to verify state update; use timeout to ensure state update is applied
    setTimeout(() => {
      console.log("Updated chat messages:", get().selectedChatMessages);
    }, 0);
  },

  addChannelInChannelList:(message)=>{
    const channels=get().channels;
    const data=channels.find((channel)=>channel._id===message.channelId);
    const index=channels.findIndex((channel)=>channel._id===message.channelId);
    if(index!== -1 && index !== undefined){
      channels.splice(index,1);
      channels.unshift(data);
    }
  },

  addContactsinDMcontacts:(message)=>{
    const userId=get().userInfo.id;
    const fromId=message.sender._id===userId ? message.recipient._id :message.sender._id;
    const fromData=message.sender._id===userId ? message.recipient:message.sender;
    const dmContacts=get().directMessagesContacts;
    const data=dmContacts.find((contact)=>contact._id===fromId);
    const index=dmContacts.findIndex((contact)=>contact._id===fromId)
    if(index != -1  && index != undefined){
      dmContacts.splice(index,1);
      dmContacts.unshift(data);
    }else{
      dmContacts.unshift(formData);
    }
    set({directMessagesContacts:dmContacts});
  }
});
