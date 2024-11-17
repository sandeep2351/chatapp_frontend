import { useAppstore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiclient from "@/lib/api-client";
import {
  HOST,
  UPDATE_PROFILE_ROUTE,
  ADD_PROFILE_IMAGE_ROUTE,
  REMOVE_PROFILE_IMAGE_ROUTE,
} from "@/utils/constants";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setuserInfo } = useAppstore();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [color, setColor] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstname(userInfo.firstName);
      setLastname(userInfo.lastName);
      setColor(userInfo.color);
    }
    if (userInfo.image) {
      setImage(`${HOST}/${userInfo.image}?${new Date().getTime()}`); // Adding timestamp to avoid cache issues
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstname) {
      toast.error("First name is required!");
      return false;
    }
    if (!lastname) {
      toast.error("Last name is required!");
      return false;
    }
    if (color === undefined || color === null) {
      toast.error("Color selection is required!");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiclient.post(
          UPDATE_PROFILE_ROUTE,
          {
            firstName: firstname,
            lastName: lastname,
            color: color,
          },
          { withCredentials: true }
        );

        if (response.status === 200 && response.data) {
          setuserInfo(response.data);
          toast.success("Profile updated successfully.");
          navigate("/chat");
        }
      } catch (error) {
        console.log("Error response:", error.response.data);
      }
    }
  };

  const handlenavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please set up your profile!");
    }
  };

  const handlefileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profile-image', file);
  
      try {
        const response = await apiclient.post(ADD_PROFILE_IMAGE_ROUTE, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        });
  
        if (response.status === 200 && response.data) {
          const imagePath = `${HOST}/${response.data.image}?${new Date().getTime()}`; // Adding timestamp to avoid cache issues
          setImage(imagePath);
          setuserInfo(prev => ({ ...prev, image: response.data.image }));
          toast.success("Image uploaded successfully.");
        }
      } catch (error) {
        console.error("Error uploading image:", error.message);
        toast.error("Failed to upload image.");
      }
    }
  };

  const handledeleteimage = async () => {
    try {
      const response = await apiclient.delete(REMOVE_PROFILE_IMAGE_ROUTE, { withCredentials: true });
      if (response.status === 200) {
        setuserInfo({ ...userInfo, image: null });
        setImage(null); // Clear the image state
        toast.success("Image removed successfully");
      }
    } catch (error) {
      console.error("Error removing image:", error.message);
      toast.error("Failed to remove image.");
    }
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-[60vw] lg:w-[40vw]">
        <div className="flex items-center gap-4 mb-8" onClick={handlenavigate}>
          <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer" />
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div
            className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                    color
                  )}`}
                >
                  {firstname
                    ? firstname.charAt(0)
                    : userInfo.email.charAt(0)}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full ring-fuchsia-50"
                onClick={image ? handledeleteimage : handlefileInputClick}
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
            name="profile-image"
            accept=".png, .jpg, .jpeg, .svg, .webp"
          />
          <div className="flex flex-col gap-5 text-white w-full">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userInfo.email}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full flex gap-5">
              {colors.map((clr, index) => (
                <div
                  key={index}
                  className={`${clr} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 ${
                    color === index ? " outline outline-white/50 outline-1" : ""
                  }`}
                  onClick={() => setColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-6">
        <Button
          className="h-16 w-[200px] bg-purple-700 hover:bg-purple-900 transition-all duration-300"
          onClick={saveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;
