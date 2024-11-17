import React, { useState } from 'react';
import Background from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";
import { Button } from "/src/components/ui/button.jsx";
import { Input } from "/src/components/ui/input.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import apiclient from '@/lib/api-client';
import { LOGIN_ROUTES, SIGNUP_ROUTES } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAppstore } from '@/store';

const Auth = () => {
  const navigate = useNavigate();
  const { setuserInfo } = useAppstore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tab, setTab] = useState('login');

  // Validate login input
  const validatelogin = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!password.trim()) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  // Validate signup input
  const validatesignup = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  // Handle login request
  const handleLogin = async () => {
    if (validatelogin()) {
      try {
        const response = await apiclient.post(LOGIN_ROUTES, { email, password }, { withCredentials: true });
        console.log("API Response:", response);

        if (response.data && response.data.user) {
          setuserInfo(response.data.user);

          if (response.data.user.profileSetup) {
            navigate("/chat");
          } else {
            navigate("/profile");
          }
        } else {
          toast.error("Login failed. No user data received.");
        }
      } catch (error) {
        console.error("Login Error:", error.response ? error.response.data : error.message);
        toast.error("Login failed. Please check your credentials.");
      }
    }
  };

  // Handle signup request
  const handleSignup = async () => {
    if (validatesignup()) {
      try {
        const response = await apiclient.post(SIGNUP_ROUTES, { email, password }, { withCredentials: true });
        console.log("Signup Response:", response);
        if (response.status === 201) {
          setuserInfo(response.data.user);
          navigate('/profile');
        }
      } catch (error) {
        console.error("Signup Error:", error.response ? error.response.data : error.message);
        toast.error("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col xl:flex-row bg-white shadow-2xl rounded-3xl overflow-hidden w-[90vw] max-w-5xl">
        <div className="flex flex-col items-center justify-center p-8 xl:w-1/2">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center">Welcome</h1>
            <img src={Victory} alt="victory emoji" className="h-[50px] ml-4" />
          </div>
          <p className="font-medium text-center mb-6">
            Fill in the details to get started with the best chat app!
          </p>
          <Tabs className="w-full" defaultValue='login' value={tab} onValueChange={(value) => setTab(value)}>
            <TabsList className="flex justify-center space-x-4">
              <TabsTrigger
                value="login"
                className="px-6 py-2 border-b-2 border-transparent text-gray-600 hover:text-purple-500 hover:border-purple-500 transition-colors duration-300"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="px-6 py-2 border-b-2 border-transparent text-gray-600 hover:text-purple-500 hover:border-purple-500 transition-colors duration-300"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="flex flex-col gap-4 mt-8">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full px-6 py-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="rounded-full px-6 py-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button className="rounded-full px-6 py-3 mt-4" onClick={handleLogin}>
                Login
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="flex flex-col gap-4 mt-8">
              <Input
                placeholder="Email"
                type="email"
                className="rounded-full px-6 py-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="rounded-full px-6 py-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                placeholder="Confirm Password"
                type="password"
                className="rounded-full px-6 py-3"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button className="rounded-full px-6 py-3 mt-4" onClick={handleSignup}>
                Sign Up
              </Button>
            </TabsContent>
          </Tabs>
        </div>
        <div className="hidden xl:flex items-center justify-center xl:w-1/2 bg-gradient-to-r from-purple-500 to-purple-700">
          <img src={Background} alt="background login" className="h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
