import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import axios from '../Config/AxiosConfig';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';

const MealBookingPage = () => {
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState({});
  const [mealType, setMealType] = useState(1);
  const [mealQuantity, setMealQuantity] = useState(1);
  const [currentUser, toast] = useOutletContext();

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/get-meals/`);
        if (response.status === 200) {
          setMeals(response.data);
        }
      } catch (error) {
        console.error(error.message);
        toast('Something Went Wrong!');
      }
      setLoading(false);
    };

    fetchMeals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mealQuantity > 0) {
        const response = await axios.post(`/book-meal/`, {
          id: mealType,
          quantity: mealQuantity,
          user: currentUser,
        });
        if (response.status === 200) {
          toast(response.data.message);
          setMealType(1);
          setMealQuantity(1);
        }
      } else {
        toast('Quantity can only be 1 or more');
        setMealQuantity(1);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <>
      {loading && <Spinner animation='border' variant='dark' />}
      {!loading && (
        <div style={{ display: 'flex', margin: '5vh' }}>
          <Container>
            <h2>Book Meal</h2>
            <Form>
              <Form.Group className='mb-3' controlId='exampleForm.ControlInput'>
                <FloatingLabel controlId='floatingSelectGrid' label='Meal Type'>
                  <Form.Select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                  >
                    {meals.map((meal, index) => {
                      return (
                        <option key={index} value={meal.id}>
                          {meal.data.meal_type}
                        </option>
                      );
                    })}
                  </Form.Select>
                </FloatingLabel>
              </Form.Group>
              <Form.Group>
                <FloatingLabel controlId='floatingInputGrid' label='Quantity'>
                  <Form.Control
                    type='number'
                    min='1'
                    value={mealQuantity}
                    onChange={(e) => setMealQuantity(e.target.value)}
                  />
                </FloatingLabel>
              </Form.Group>
              <div className='d-grid' style={{ margin: '2vh 0vh' }}>
                <Button
                  variant='dark'
                  size='lg'
                  type='submit'
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
              </div>
            </Form>
          </Container>
          <Container>
            <h2>Menu</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Meal Type</th>
                  <th>Price / Meal</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((meal, index) => {
                  return (
                    <tr key={index}>
                      <td>{meal.id}</td>
                      <td>{meal.data.meal_type}</td>
                      <td>{meal.data.meal_price} $</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Container>
        </div>
      )}
    </>
  );
};

export default MealBookingPage;
