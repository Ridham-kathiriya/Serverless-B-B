import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { getCurrentUserAttributes, isUserSessionActive } from '../Services/AuthService';

const ValidateUserSession = (props) => {
  const [userSessionStatus, setUserSessionStatus] = useState('validating');
  const navigate = useNavigate();

  useEffect(() => {
    isUserSessionActive()
      .then(() => setUserSessionStatus('validated'))
      .catch(() => {
        navigate('/login');
      });
  }, [navigate]);

  if (userSessionStatus === 'validating') {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: 0,
          zIndex: 1040
        }}>
        <Spinner
          animation='border'
          role='status'
        />
      </div>
    );
  }

  return props.children;
};

export default ValidateUserSession;
