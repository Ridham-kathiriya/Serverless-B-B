import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Container from 'react-bootstrap/Container';
import axios from '../Config/AxiosConfig';
import { useState, useEffect } from 'react';
import Spinner from 'react-bootstrap/Spinner';
const axioss = require('axios');

const ReviewPage = () => {
  const [loading, setLoading] = useState(true);
  const [percent, setPercent] = useState(25);
  const [feedback, setFeedback] = useState('');
  const [predictionOutput, setPredictionOutput] = useState('0');
  const [afterStorage, setAfterStorage] = useState({});

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  useEffect(() => {
    setLoading(true);
    const fetchPercent = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `https://us-central1-csci-5410-s22.cloudfunctions.net/feedback_analysis`
        );
        setPercent(response.data.positive_feedback_prcnt);
        //console.log(percent.data.positive_feedback_prcnt);
      } catch (error) {
        console.error(error.message);
        setPercent(percent + 0.6);
        setLoading(false);
      }
      setLoading(false);
    };

    fetchPercent();
  }, [afterStorage]);

  //this will return predicted sentiment
  const getSentiment = async (
    sentence,
    Bearer_token,
    ProjectId,
    EndpointId
  ) => {
    try {
      const res = await axios.post(
        'https://us-central1-aiplatform.googleapis.com/ui/projects/' +
          ProjectId +
          '/locations/us-central1/endpoints/' +
          EndpointId +
          ':predict',
        { instances: { mimeType: 'text/plain', content: sentence } },
        {
          headers: {
            Authorization: 'Bearer ' + Bearer_token,
            'content-type': 'application/json',
          },
        }
      );
      console.log('s' + res.data.predictions[0].sentiment);
      return res.data.predictions[0].sentiment;
    } catch (e) {
      console.log('something is wrong with api');
      return '0';
    }
  };
  //You must require Bearer_token for the model
  const predictSentiment = async () => {
    //predicting sentiment
    const Bearer_token = process.env.REACT_APP_BEARER_TOKEN;
    const ProjectId = 'ml-learning-352715';
    const EndpointId = '5946255640035852288';
    const s = await getSentiment(feedback, Bearer_token, ProjectId, EndpointId);
    setPredictionOutput(s);

    //storing sentiment
    try {
      const res = await axios.post(
        'https://us-central1-csci-5410-s22.cloudfunctions.net/storeFeedbackWithRate?feedback=' +
          feedback.toString() +
          '&rating=' +
          predictionOutput
      );
      setAfterStorage(res);
    } catch (e) {
      setAfterStorage({});
    }
  };

  return (
    <>
      {loading && <Spinner animation='border' variant='dark' />}
      {!loading && (
        <div style={{ display: 'flex', margin: '5vh' }}>
          <Container>
            <h2>Please Provide Your Feedback</h2>
            <Form>
              <Form.Group>
                <FloatingLabel
                  controlId='feedbackLabel'
                  label='Feedback'
                  onChange={handleFeedbackChange}
                >
                  <Form.Control type='text' placeholder='1' />
                </FloatingLabel>
              </Form.Group>
              <div className='d-grid' style={{ margin: '2vh 0vh' }}>
                <Button variant='dark' size='lg' onClick={predictSentiment}>
                  Submit
                </Button>
              </div>
            </Form>
          </Container>
          <Container>
            <h2 style={{ marginBottom: '10vh' }}>Reviews on ServerlessB&B</h2>
            <h5>Positive Reviews: {percent} %</h5>
            <h5>Negative Reviews: {100 - percent}%</h5>
          </Container>
        </div>
      )}
    </>
  );
};

export default ReviewPage;
