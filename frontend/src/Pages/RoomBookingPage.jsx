import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import axios from '../Config/AxiosConfig';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import useAuthHook from '../Hooks/useAuth';

const RoomBookingPage = (props) => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState({});
  const [roomType, setRoomType] = useState('Deluxe');
  const [roomCount, setRoomCount] = useState(1);
  const [availability, setAvailability] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const { userAttributes } = useAuthHook(); 

  const roomQuantity = [1, 2, 3, 4, 5];
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/get-rooms/`);
        if (response.status === 200) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    };

    fetchRooms();
  }, []);

  const handleClose = () => setShowDialog(false);

  const confirmBooking = async (e) => {
    if(userAttributes.email !== "") {
      try {
        const response = await axios.post(`/book-rooms/`, {
          checkin_date: checkInDate,
          checkout_date: checkOutDate,
          user_id: userAttributes.email,
          room_type: roomType,
          rooms_qty: roomCount,
        });
        if (response.data.success) {
          console.log(response.data);
          setShowDialog(false);
          navigate('/');
        } else {
          setShowDialog(false);
        }
      } catch (error) {
        console.error(error.message);
      }
    }
    else {
      navigate('/login');
    }
  };

  const getAvailableRooms = async (e) => {
    try {
      const response = await axios.post(`/get-available-rooms/`, {
        checkin_date: checkInDate,
        checkout_date: checkOutDate
      });
      if (
        Object.keys(response.data)[0] === checkInDate &&
        Object.keys(response.data)[Object.keys(response.data).length - 1] ===
          checkOutDate
      ) {
        const availabilityMessage = `${roomType} room is available from ${checkInDate} to ${checkOutDate}. Please select 'Confirm' to book the rooms`;
        setAvailability(availabilityMessage);
        setShowDialog(true);
      } else {
        const availabilityMessage = `${roomType} room is not available from ${checkInDate} to ${checkOutDate}. Please select other dates`;
        setAvailability(availabilityMessage);
        setShowDialog(true);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const setDate = (type, date) => {
    const dateArray = date.split('-');
    const dateInput = dateArray[1] + '-' + dateArray[2] + '-' + dateArray[0];
    if (type === 'in') {
      setCheckInDate(dateInput);
    } else {
      setCheckOutDate(dateInput);
    }
  };

  return (
    <>
      <Header />
      {loading && <Spinner animation='border' variant='dark' />}
      {!loading && (
        <div style={{ display: 'flex', margin: '5vh' }}>
          <Container>
            <h2>Book Room</h2>
            <Form>
              <Form.Group className='mb-3' controlId='roomType'>
                <FloatingLabel controlId='roomType' label='Room Type'>
                  <Form.Select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    {rooms?.map((room, index) => {
                      return (
                        <option key={index} value={room.data.room_type}>
                          {room.data.room_type}
                        </option>
                      );
                    })}
                  </Form.Select>
                </FloatingLabel>
              </Form.Group>
              <Form.Group className='mb-3'>
                <FloatingLabel controlId='checkInDate' label='Check In Date'>
                  <Form.Control
                    type='date'
                    placeholder=''
                    onChange={(e) => setDate('in', e.target.value)}
                  ></Form.Control>
                </FloatingLabel>
              </Form.Group>
              <Form.Group className='mb-3'>
                <FloatingLabel controlId='checkOutDate' label='Check Out Date'>
                  <Form.Control
                    type='date'
                    placeholder=''
                    onChange={(e) => setDate('out', e.target.value)}
                  ></Form.Control>
                </FloatingLabel>
              </Form.Group>
              <Form.Group className='mb-3' controlId='exampleForm.ControlInput'>
                <FloatingLabel
                  controlId='floatingSelectGrid'
                  label='Room Count'
                >
                  <Form.Select
                    value={roomCount}
                    onChange={(e) => setRoomCount(e.target.value)}
                  >
                    {roomQuantity.map((room, index) => {
                      return (
                        <option key={index} value={room}>
                          {room}
                        </option>
                      );
                    })}
                  </Form.Select>
                </FloatingLabel>
              </Form.Group>
            </Form>
            <div className='d-grid' style={{ margin: '2vh 0vh' }}>
              <Button
                variant='dark'
                size='lg'
                type='submit'
                onClick={(e) => getAvailableRooms(e)}
              >
                Check Availability
              </Button>
            </div>
            <Modal show={showDialog} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Booking Confirmation</Modal.Title>
              </Modal.Header>
              <Modal.Body>{availability}</Modal.Body>
              <Modal.Footer>
                <Button variant='secondary' onClick={handleClose}>
                  Cancel
                </Button>
                {!availability.includes('not available') && (
                  <Button variant='dark' onClick={confirmBooking}>
                    Confirm
                  </Button>
                )}
              </Modal.Footer>
            </Modal>
          </Container>
          <Container>
            <h2>Prices</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Room Type</th>
                  <th>Price / Night</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, index) => {
                  return (
                    <tr key={index}>
                      <td>{room.id}</td>
                      <td>{room.data.room_type}</td>
                      <td>{room.data.room_price} $</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Container>
        </div>
      )}
      <Footer />
    </>
  );
};

export default RoomBookingPage;
