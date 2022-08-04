import React from 'react';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { ToastContainer, toast } from 'react-toastify';
import { fetchToken, onMessageListener } from '../firebase';
import useAuthHook from '../Hooks/useAuth';

const OutletPage = () => {
  const { fetchingUserDetails, userAttributes } = useAuthHook();
  const [isTokenFound, setTokenFound] = useState(false);
  if (!fetchingUserDetails && userAttributes.email !== '') {
    fetchToken(setTokenFound, userAttributes.email);
  }
  onMessageListener()
    .then((payload) => {
      toast(payload.notification.body);
    })
    .catch((err) => console.log('failed: ', err));
  return (
    <div>
      <Header />
      {!isTokenFound && <h1>Please Provide Notification Permissions</h1>}
      {!fetchingUserDetails && isTokenFound && (
        <Outlet context={[userAttributes.email, toast]} />
      )}
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default OutletPage;
