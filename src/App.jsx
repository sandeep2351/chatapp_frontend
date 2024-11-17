import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Pages/auth';
import Profile from './Pages/profile';
import Chat from './Pages/chat';
import { useAppstore } from './store';
import apiclient from './lib/api-client';
import { GET_USER_INFO } from './utils/constants';

const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppstore();
  const isAuthenticated = !!userInfo;
  console.log('PrivateRoute check:', isAuthenticated); // Debugging
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppstore();
  const isAuthenticated = !!userInfo;
  console.log('AuthRoute check:', isAuthenticated); // Debugging
  return isAuthenticated ? <Navigate to="/chat" /> : children;
};

const App = () => {
  const { userInfo, setuserInfo } = useAppstore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getuserdata = async () => {
      try {
        const response = await apiclient.get(GET_USER_INFO, {
          withCredentials: true,
        });
        console.log('Response:', response); // Improved logging
        if (response.status === 200 && response.data) {
          setuserInfo(response.data);
        } else {
          setuserInfo(null); // Ensure userInfo is null if no data
        }
      } catch (error) {
        console.error('Error fetching user data:', error); // Improved error logging
        setuserInfo(null); // Ensure userInfo is null if there's an error
      } finally {
        setLoading(false);
      }
    };

    getuserdata();
  }, [setuserInfo]);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log('Current userInfo:', userInfo); // Debugging

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        } />
        <Route path="/chat" element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
