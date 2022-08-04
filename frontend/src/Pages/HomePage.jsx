import React from 'react';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import { useState, useEffect } from 'react';
import axios from '../Config/AxiosConfig';
import { useOutletContext } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({});
  const [invoices, setInvoices] = useState({});
  const [currentUser, toast] = useOutletContext();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/get-notifications?id=${currentUser}`
        );
        if (response.status === 200) {
          setNotifications(response.data.notifications);
          setInvoices(response.data.invoices);
        }
      } catch (error) {
        console.error(error.message);
        toast('Something Went Wrong!');
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  return (
    <>
      <div>
        <Container>
          <h1 style={{ margin: '5vh' }}>Welcome to ServerlessB&B! 🏠</h1>
        </Container>
        {loading && <Spinner animation='border' variant='dark' />}
        {!loading && (
          <Container
            style={{ display: 'flex', justifyContent: 'space-evenly' }}
          >
            <div>
              <h2>Notifications</h2>
              <Table style={{ marginTop: '5vh' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification, index) => {
                    return (
                      <tr key={index}>
                        <td>{notification.timestamp}</td>
                        <td>{notification.message}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            <div>
              <h2>Invoices</h2>
              <Table style={{ marginTop: '5vh' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => {
                    return (
                      <tr key={index}>
                        <td>{invoice.order_id}</td>
                        <td>{invoice.order_type}</td>
                        <td>{invoice.amount} $</td>
                        <td>{invoice.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Container>
        )}
      </div>
    </>
  );
};

export default HomePage;
