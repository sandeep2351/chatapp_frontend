import React from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { TooltipTrigger } from '@/components/ui/tooltip';
import { getColor } from '@/lib/utils';
import { useAppstore } from '@/store'
import { HOST } from '@/utils/constants';
import { Tooltip, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { IoPowerSharp } from 'react-icons/io5';
import apiclient from '@/lib/api-client';
import { LOG_OUT_ROUTE } from '@/utils/constants';

const Profile_info = () => {
    const { userInfo, setuserInfo } = useAppstore();
    const navigate = useNavigate();

    console.log('userInfo:', userInfo); // Log userInfo to check its structure and data

    const logout = async () => {
        try {
            const response = await apiclient.post(LOG_OUT_ROUTE, {}, { withCredentials: true });
            if (response.status === 200) {
                navigate("/auth");
                setuserInfo(null);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Failed to logout. Please try again later.');
        }
    }

    return (
        <div className='absolute bottom-0 h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]'>
            <div className="flex gap-3 items-center justify-center">
                <div className='w-12 h-12 relative'>
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden -ml-5">
                        {userInfo?.image ? (
                            <AvatarImage
                                src={`${HOST}/${userInfo.image}`}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                                    userInfo?.color
                                )}`}
                            >
                                {userInfo?.firstname
                                    ? userInfo.firstname.charAt(0)
                                    : userInfo?.email?.charAt(0) || "?"}
                            </div>
                        )}
                    </Avatar>
                </div>
                <div>
                    {userInfo?.firstName && userInfo?.lastName
                        ? `${userInfo.firstName} `
                        : "No Name Available"}
                </div>
            </div>
            <div className="flex gap-5">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <FiEdit2 className='text-purple-500 text-xl font-medium'
                                onClick={() => navigate("/Profile")}
                            />
                        </TooltipTrigger>
                        <TooltipContent className='bg-[#1c1b1e] border-none text-white'>
                            Edit Profile
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <IoPowerSharp className='text-red-500 text-xl font-medium'
                                onClick={logout}
                            />
                        </TooltipTrigger>
                        <TooltipContent className='bg-[#1c1b1e] border-none text-white'>
                            Logout
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

export default Profile_info;
