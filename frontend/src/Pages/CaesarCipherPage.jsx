import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import axios from '../Config/AxiosConfig';
import { useState, useEffect } from 'react';
import { Spinner, FloatingLabel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userLogInEvent } from '../Services/AuthService';

const CaesarCipherPage = (props) => {
  const [loading, setLoading] = useState(false);
  const [plainText, setPlainText] = useState('');
  const [wrongInputError, setWrongInputError] = useState('');
  const navigate = useNavigate();

  const handleCaesarCipher = async (event) => {
    setLoading(true);
    event.preventDefault();
    const cipherTextInput = event.target.cipherText.value;
    try {
      const response = await axios.post(`/caesar-cipher/`, {
        plain_text: plainText,
        user_id: props.userId,
        cipher_text: cipherTextInput,
      });
        if (response.data.success) {
          document.dispatchEvent(userLogInEvent);
          localStorage.setItem('cipher-key-verification-status', 'verified');
          await axios.post('/update_session_timestamp/', {
            email: props.userId,
          })
          navigate('/home', { state: { userId: props.userId } });
        }
        else {
          setLoading(false);
          setWrongInputError("Wrong input! Please try again.")
        }
    } catch (error) {
        setLoading(false);
        setWrongInputError("Wrong input! Please try again.")
    }
  };

  //https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  const generatePlainText = () => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * 5));
    }
    return result;
  };

  useEffect(() => {
    const plainText = generatePlainText();
    setPlainText(plainText);
  }, []);

  return (
    <div style={{ display: 'flex', margin: '5vh' }}>
      <Container>
        <h2 style={{ marginBottom: '24px' }}>
          Solve this Caesar Cipher with your Key!
        </h2>
        <Form method='POST' onSubmit={(event) => handleCaesarCipher(event)}>
          <Form.Group style={{ marginBottom: '24px' }}>
            <FloatingLabel controlId='answerLabel' label='Plain Text'>
              <Form.Control type='text' readOnly defaultValue={plainText} />
            </FloatingLabel>
          </Form.Group>
          <Form.Group>
            <FloatingLabel controlId='cipherLabel' label='Cipher Text'>
              <Form.Control
                type='text'
                name='cipherText'
                placeholder='Cipher Text'
              />
            </FloatingLabel>
          </Form.Group>
          <div className='d-grid' style={{ margin: '2vh 0vh' }}>
            <Button variant='dark' size='lg' type='submit' disabled={loading}>
              <Spinner
                hidden={!loading}
                animation='grow'
                as='span'
                size='sm'
                role='status'
                aria-hidden='true'
                style={{ marginRight: '8px' }}
              />
              Submit
            </Button>
          </div>
        </Form>
        <p style={{color: "red"}}>{wrongInputError}</p>
      </Container>
    </div>
  );
};

export default CaesarCipherPage;
