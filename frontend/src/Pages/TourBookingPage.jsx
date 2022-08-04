import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import axios from "../Config/AxiosConfig";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
const axioss = require("axios");

const TourBookingPage = () => {
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState({});
  const [ptour, setPtours] = useState("");
  const [duration, setDuration] = useState(0);

  const handleDurationChange = (event) => {
    setDuration(event.target.value);
  };
  const [tourType, setTourType] = useState(1);
  const [tourQuantity, setTourQuantity] = useState(1);
  const [currentUser, toast] = useOutletContext();

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/get-tours/`);
        if (response.status === 200) {
          setTours(response.data);
        }
      } catch (error) {
        console.error(error.message);
        toast("Something Went Wrong!");
      }
      setLoading(false);
    };

    fetchTours();
  }, []);

  const predictPackage = async (
    duration,
    Bearer_token,
    ProjectId,
    EndpointId
  ) => {
    try {
      const res = await axioss.post(
        "https://us-central1-aiplatform.googleapis.com/v1/projects/" +
          ProjectId +
          "/locations/us-central1/endpoints/" +
          EndpointId +
          ":predict",
        { instances: { duration: duration } },
        {
          headers: {
            Authorization: "Bearer " + Bearer_token,
            "content-type": "application/json",
          },
        }
      );
      const maxi = await Math.max(...res.data.predictions[0].scores);
      const ind = await res.data.predictions[0].scores.indexOf(maxi);
      //console.log(res.data.predictions[0].classes[ind]);
      return res.data.predictions[0].classes[ind];
    } catch (e) {
      return 1;
    }
  };

  const predictTour = async () => {
    const tourTypess = {
      0: "Adventure",
      1: "WildLife",
      2: "Nature",
    };
    //You must require Bearer_token for the model
    const Bearer_token = process.env.REACT_APP_BEARER_TOKEN;
    const ProjectId = "ml-learning-352715";
    const EndpointId = "8254772661528297472";

    const output = await predictPackage(
      duration.toString(),
      Bearer_token,
      ProjectId,
      EndpointId
    );
    //console.log("Output : " + output);
    setPtours(tourTypess[output]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tourQuantity > 0) {
        const response = await axios.post(`/book-tour/`, {
          id: tourType,
          quantity: tourQuantity,
          user: currentUser,
        });
        if (response.status === 200) {
          toast(response.data.message);
          setTourType(1);
          setTourQuantity(1);
        }
      } else {
        toast("No of people can only be 1 or more");
        setTourQuantity(1);
      }
    } catch (error) {
      console.error(error.message);
    }
  };
  return (
    <>
      {loading && <Spinner animation="border" variant="dark" />}
      {!loading && (
        <div style={{ display: "flex" }}>
          <div style={{ flex: "1" }}>
            <Container>
              <h2>Predict Tour</h2>
              <Form>
                <Form.Group>
                  <FloatingLabel
                    controlId="floatingInputGrid"
                    label="Stay duration"
                    onChange={handleDurationChange}
                  >
                    <Form.Control type="number" placeholder="1" />
                  </FloatingLabel>
                </Form.Group>
                <div className="d-grid" style={{ margin: "2vh 0vh" }}>
                  <Button variant="dark" size="lg" onClick={predictTour}>
                    Predict
                  </Button>
                </div>
                <div className="d-grid" style={{ margin: "2vh 0vh" }}>
                  {ptour.length > 0 && (
                    <h5>You should select "{ptour}" type of tour!</h5>
                  )}
                </div>
              </Form>
            </Container>
            <Container>
              <h2>Book Tour</h2>
              <Form>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput"
                >
                  <FloatingLabel
                    controlId="floatingSelectGrid"
                    label="Tour Type"
                  >
                    <Form.Select
                      value={tourType}
                      onChange={(e) => setTourType(e.target.value)}
                    >
                      {tours.map((tour, index) => {
                        return (
                          <option key={index} value={tour.id}>
                            {tour.data.tour_type}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </FloatingLabel>
                </Form.Group>
                <Form.Group>
                  <FloatingLabel
                    controlId="floatingInputGrid"
                    label="No. of People"
                  >
                    <Form.Control
                      type="number"
                      min="1"
                      value={tourQuantity}
                      onChange={(e) => setTourQuantity(e.target.value)}
                    />
                  </FloatingLabel>
                </Form.Group>
                <div className="d-grid" style={{ margin: "2vh 0vh" }}>
                  <Button
                    variant="dark"
                    size="lg"
                    type="submit"
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </div>
              </Form>
            </Container>
          </div>
          <div style={{ flex: "1" }}>
            <Container>
              <h2>Prices</h2>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tour Type</th>
                    <th>Price / Person</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map((tour, index) => {
                    return (
                      <tr key={index}>
                        <td>{tour.id}</td>
                        <td>{tour.data.tour_type}</td>
                        <td>{tour.data.tour_price} $</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Container>
          </div>
        </div>
      )}
    </>
  );
};

export default TourBookingPage;
