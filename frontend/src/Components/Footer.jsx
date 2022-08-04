import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { ReactComponent as ReactLogo } from '../Assets/logo.svg';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <Navbar bg='dark' variant='dark'>
      <Container style={{ height: '30vh' }}>
        <Navbar.Brand onClick={() => navigate('/home')}>
          <ReactLogo style={{ width: '30vw', height: '15vh' }} />
        </Navbar.Brand>
        <Nav className='justify-content-end flex-column'>
          <Nav.Link onClick={() => navigate('/')}>Rooms</Nav.Link>
          <Nav.Link onClick={() => navigate('/meals')}>Meals</Nav.Link>
          <Nav.Link onClick={() => navigate('/tours')}>Tours</Nav.Link>
        </Nav>
        <Nav className='justify-content-end flex-column'>
          <Nav.Link onClick={() => navigate('/')}>Home</Nav.Link>
          <Nav.Link href='#faq'>FAQ</Nav.Link>
          <Nav.Link href='#about'>About</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Footer;
