import React, { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import apiclient from "@/lib/api-client";
import {
  CREATE_CHANNELS_ROUTE,
  GET_ALL_CONTACTS_ROUTES,
} from "@/utils/constants";
import { createChatslice } from "@/store/slices/chat-slice";
import { useAppstore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multiselect";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectedChatData, addchannel } =
    useAppstore();
  const [newchannelmodel, setNewchannelmodel] = useState(false);
  const [allcontacts, setAllcontacts] = useState([]);
  const [selectedcontacts, setSelectedcontacts] = useState([]);
  const [channelname, setChannelname] = useState("");

  useEffect(() => {
    const getdata = async () => {
      const response = await apiclient.get(GET_ALL_CONTACTS_ROUTES, {
        withCredentials: true,
      });
      setAllcontacts(response.data.contacts);
    };
    getdata();
  }, []);

  const createchannel = async () => {
    try {
      if(channelname.length>=0 && selectedcontacts.length>0){
      const response = await apiclient.get(CREATE_CHANNELS_ROUTE, {
        name: channelname,
        members:selectedcontacts.map((contact)=>contact.value),
      },{withCredentials:true});
if(response.status===201){
  setChannelname(" ");
  setSelectedcontacts([]);
  setNewchannelmodel(false);
  addchannel(response.data.channel);
}
    }
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setNewchannelmodel(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white ">
            Create New Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={newchannelmodel} onOpenChange={setNewchannelmodel}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col ">
          <DialogHeader>
            <DialogTitle>
              Please Fill Up The Details For New Channel
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-3 bg-[#2c2e3b] border-none mb-3"
              onChange={(e) => setChannelname(e.target.value)}
              value={channelname}
            />
          </div>
          <div>{/* <MultipleSelector/> */}</div>
          <div>
            <Button
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
              onClick={createchannel}
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
