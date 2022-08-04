import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { ReactComponent as ReactLogo } from '../Assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import useAuthHook from '../Hooks/useAuth';
import { logoutUser } from '../Services/AuthService';

const Header = () => {
  const { isAuthenticated, userAttributes } = useAuthHook();
  const navigate = useNavigate();
  return (
    <Navbar collapseOnSelect expand='lg' bg='dark' variant='dark'>
      <Container>
        <Navbar.Brand onClick={() => navigate('/home')}>
          <ReactLogo style={{ width: '20vw', height: '10vh' }} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav className='me-auto'>
            <Nav.Link onClick={() => navigate('/')}>Rooms</Nav.Link>
            <Nav.Link onClick={() => navigate('/meals')}>Meals</Nav.Link>
            <Nav.Link onClick={() => navigate('/tours')}>Tours</Nav.Link>
            <Nav.Link onClick={() => navigate('/feedback')}>Feedback</Nav.Link>
            <Nav.Link onClick={() => navigate('/visualizations')}>
              Visualizations
            </Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link>{userAttributes.email}</Nav.Link>
                <Nav.Link onClick={() => navigate('/login-statistics', { state: { userId: userAttributes.email } }) }>Login Statistics</Nav.Link>
                <Nav.Link onClick={() => logoutUser()}>Log Out</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link onClick={() => navigate('/register')}>
                  Register
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/login')}>Login</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
