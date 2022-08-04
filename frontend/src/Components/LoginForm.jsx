import React from 'react';
import {
  Button,
  Form,
  Spinner,
  Container,
  FloatingLabel,
} from 'react-bootstrap';
import {
  authenticateUser,
  isUserSessionActive,
} from '../Services/AuthService';
import axios from '../Config/AxiosConfig';
import CaesarCipherPage from '../Pages/CaesarCipherPage';

const FormModes = Object.freeze({
  Login: Symbol('login'),
  SecurityQuestion: Symbol('security_question'),
  CipherKey: Symbol('cipher_key'),
});

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formMode: FormModes.Login,
      email: '',
      loginFormErrors: {
        email: '',
        password: '',
      },
      securityQuestion: '',
      securityQuestionError: '',
      loading: false,
    };
  }

  componentDidMount() {
    isUserSessionActive()
      .then(() =>
        this.setState({
          formMode: FormModes.CipherKey,
        })
      )
      .catch(() => {});
  }

  handleLoginSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    const loginFormErrors = {
      email: '',
      password: '',
    };

    if (email === null || email === undefined || email.length === 0) {
      loginFormErrors.email = 'Please enter an email.';
    }

    if (password === null || password === undefined || password.length === 0) {
      loginFormErrors.password = 'Please enter a password.';
    }

    if (loginFormErrors.email !== '' || loginFormErrors.password !== '') {
      this.setState({
        loginFormErrors,
      });

      return;
    }

    this.setState({
      loading: true,
      loginFormErrors
    });

    try {
      await authenticateUser(email, password);
      const questionResponse = await axios.post('/get-security-question', {
        email,
      });

      this.setState({
        email,
        securityQuestion: questionResponse.data.question,
        formMode: FormModes.SecurityQuestion,
      });
    } catch (error) {
      console.log(error);
      this.setState({
        loginFormErrors: {
          password: 'Incorrect email ID or password provided.'
        }
      });
    }

    this.setState({
      loading: false,
    });
  };

  handleSecurityQuestionSubmit = async (event) => {
    event.preventDefault();

    const answer = event.target.answer.value;

    if (answer === null || answer === undefined || answer.length === 0) {
      this.setState({
        securityQuestionError: 'Please enter an answer.',
      });

      return;
    }

    this.setState({
      loading: true,
      securityQuestionAnswerError: ''
    });

    try {
      await axios.post('/validate-security-question-answer', {
        email: this.state.email,
        answer,
      });

      localStorage.setItem('security-question-answer-status', 'answered');
      await axios.post('/set-user-status', {
        email: this.state.email,
        status: true,
      });
      this.setState({
        formMode: FormModes.CipherKey,
      });
    } catch (error) {
      this.setState({
        securityQuestionAnswerError: 'Incorrect answer provided.'
      });
    }

    this.setState({
      loading: false,
    });
  };

  render() {
    const { email: emailError, password: passwordError } =
      this.state.loginFormErrors;

    if (this.state.formMode === FormModes.CipherKey) {
      const { email } = this.state;
      return (
        <Container
          style={{
            margin: '32px',
            display: 'flex',
            flexFlow: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CaesarCipherPage userId={email} />
        </Container>
      );
    }

    if (this.state.formMode === FormModes.SecurityQuestion) {
      return (
        <Container
          style={{
            margin: '32px auto',
            display: 'flex',
            flexFlow: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h2>Answer your security question</h2>
          <h3>Q.{this.state.securityQuestion}</h3>
          <Container style={{ width: '50%', textAlign: 'left' }}>
            <Form
              method='POST'
              onSubmit={this.handleSecurityQuestionSubmit}
              style={{ marginTop: '32px' }}
            >
              <Form.Group style={{ marginBottom: '24px' }}>
                <FloatingLabel controlId='answerLabel' label='Answer'>
                  <Form.Control
                    name='answer'
                    type='text'
                    placeholder='Answer'
                  />
                  {this.state.securityQuestionError && (
                    <Form.Text style={{ color: 'red', fontWeight: 'bold' }}>
                      *{this.state.securityQuestionError}
                    </Form.Text>
                  )}
                </FloatingLabel>
              </Form.Group>
              <div
                className='d-grid'
                style={{ display: 'flex', margin: '2vh 0vh' }}
              >
                <Button
                  variant='dark'
                  size='lg'
                  name='submit'
                  type='submit'
                  disabled={this.state.loading}
                >
                  <Spinner
                    hidden={!this.state.loading}
                    animation='grow'
                    as='span'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                    style={{ marginRight: '8px' }}
                  />
                  Submit Answer
                </Button>
              </div>
            </Form>
          </Container>
        </Container>
      );
    }

    // login form UI
    return (
      <div>
        <Container
          style={{
            margin: '32px auto',
            display: 'flex',
            flexFlow: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Container style={{ width: '50%', textAlign: 'left' }}>
            <h2 style={{ textAlign: 'center' }}>Login to Enter!</h2>
            <Form
              method='POST'
              onSubmit={this.handleLoginSubmit}
              style={{ marginTop: '32px' }}
            >
              <Form.Group style={{ marginBottom: '24px' }}>
                <FloatingLabel controlId='emailLabel' label='Email'>
                  <Form.Control name='email' type='email' placeholder='Email' />
                  {emailError && (
                    <Form.Text style={{ color: 'red', fontWeight: 'bold' }}>
                      *{emailError}
                    </Form.Text>
                  )}
                </FloatingLabel>
              </Form.Group>
              <Form.Group style={{ marginBottom: '24px' }}>
                <FloatingLabel controlId='passwordLabel' label='Password'>
                  <Form.Control
                    name='password'
                    type='password'
                    placeholder='Password'
                  />
                  {passwordError && (
                    <Form.Text style={{ color: 'red', fontWeight: 'bold' }}>
                      *{passwordError}
                    </Form.Text>
                  )}
                </FloatingLabel>
              </Form.Group>
              <div
                className='d-grid'
                style={{ display: 'flex', margin: '2vh 0vh' }}
              >
                <Button
                  variant='dark'
                  size='lg'
                  name='submit'
                  type='submit'
                  disabled={this.state.loading}
                >
                  <Spinner
                    hidden={!this.state.loading}
                    animation='grow'
                    as='span'
                    size='sm'
                    role='status'
                    aria-hidden='true'
                    style={{ marginRight: '8px' }}
                  />
                  Log In
                </Button>
              </div>
            </Form>
          </Container>
        </Container>
      </div>
    );
  }
}

export default LoginForm;
