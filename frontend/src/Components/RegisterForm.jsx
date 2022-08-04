import React from 'react';
import {
  Button,
  Form,
  Spinner,
  Container,
  Alert,
  FloatingLabel,
} from 'react-bootstrap';
import {
  isUserSessionActive,
  registerUser,
  validateEmailOTP,
} from '../Services/AuthService';
import axios from '../Config/AxiosConfig';
import { Navigate } from 'react-router-dom';

const FormModes = Object.freeze({
  Registration: Symbol('registration'),
  OtpVerification: Symbol('otp_verification'),
  SecurityQuestion: Symbol('security_question'),
  CipherKey: Symbol('cipher_key'),
  Success: Symbol('success'),
});

const securityQuestions = [
  'What was the name of your first pet?',
  'What was the name of your first school?',
  'In which city were you born?',
  "What company's car did you first own?",
  'What was the name of your childhood best friend?',
];

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formMode: FormModes.Registration,
      registrationValues: {
        email: '',
        firstName: '',
        lastName: '',
      },
      registrationFormErrors: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      },
      otpFormErrors: {
        otp: '',
      },
      securityQuestionsValue: {
        question: '',
        answer: '',
      },
      securityQuestionsFormErrors: {
        question: '',
        answer: '',
      },
      cipherKeyFormError: {
        cipherKey: ''
      },
      loading: false,
      redirectToLogin: false,
    };
  }

  componentDidMount() {
    isUserSessionActive()
      .then(() => this.setState({ redirectToLogin: true }))
      .catch((ignored) => {});
  }

  handleRegisterSubmit = async (event) => {
    event.preventDefault();

    this.setState({ loading: true });

    const firstName = event.target.firstName.value;
    const lastName = event.target.lastName.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    const dataValid = this.validateRegisterForm(
      firstName,
      lastName,
      email,
      password
    );

    if (dataValid) {
      try {
        const response = await registerUser(
          email,
          password,
          firstName,
          lastName
        );
        console.log(response);
        this.setState({
          formMode: FormModes.OtpVerification,
          registrationValues: { email, firstName, lastName },
        });
      } catch (error) {
        if (error.name === 'UsernameExistsException') {
          this.setState((currentState) => ({
            ...currentState,
            registrationFormErrors: {
              ...currentState.registrationFormErrors,
              email: 'Please enter a unique email ID.',
            },
          }));
        }
        console.error(error);
      }
    }

    this.setState({
      loading: false,
    });
  };

  validateRegisterForm = (firstName, lastName, email, password) => {
    const registrationFormErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    };

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (
      firstName === null ||
      firstName === undefined ||
      firstName.length === 0
    ) {
      registrationFormErrors.firstName = 'Please enter a first name.';
    }

    if (lastName === null || lastName === undefined || lastName.length === 0) {
      registrationFormErrors.lastName = 'Please enter a last name.';
    }

    if (email === null || email === undefined || email.length === 0) {
      registrationFormErrors.email = 'Please enter an email.';
    } else if (!emailRegex.test(email)) {
      registrationFormErrors.email = 'Please enter a valid email.';
    }

    if (password === null || password === undefined || password.length === 0) {
      registrationFormErrors.password = 'Please enter a password.';
    } else if (!passwordRegex.test(password)) {
      registrationFormErrors.password =
        'Please enter a valid password that is longer than 8 characters and contains special characters, numbers, uppercase and lowercase letters.';
    }

    this.setState({ registrationFormErrors });

    return Object.values(registrationFormErrors).every(
      (error) => error.length === 0
    );
  };

  handleOtpVerificationSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    const otp = event.target.otp.value;

    const otpRegex = /^[0-9]{6}$/;

    if (otpRegex.test(otp)) {
      try {
        const result = await validateEmailOTP(
          this.state.registrationValues.email,
          otp
        );
        this.setState({
          formMode: FormModes.SecurityQuestion,
        });
        console.log(result);
      } catch (error) {
        console.error(error);
        this.setState({
          otpFormErrors: {
            otp: 'OTP entered could not be verified.',
          },
        });
      }
    } else {
      this.setState({
        otpFormErrors: {
          otp: 'Please enter a valid 6-digit OTP.',
        },
      });
    }

    this.setState({ loading: false });
  };

  handleSecurityQuestionsFormSubmission = (e) => {
    e.preventDefault();

    this.setState({ loading: true });

    const question = e.target.question.value;
    const answer = e.target.answer.value;

    const errors = {
      question: '',
      answer: '',
    };

    if (!securityQuestions.includes(question)) {
      errors.question = 'Please select a security question.';
    }

    if (answer === undefined || answer === null || answer.length === 0) {
      errors.answer = 'Please enter an answer.';
    }

    if (!Object.values(errors).every((error) => error.length === 0)) {
      this.setState({
        securityQuestionsFormErrors: errors,
      });

      return;
    }

    axios
      .post('/store-security-question', {
        email: this.state.registrationValues.email,
        question,
        answer,
      })
      .then(() => {
        this.setState({
          formMode: FormModes.CipherKey,
          loading: false,
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          loading: false,
        });
      });
  };

  handleCipherKeyFormSubmission = async (e) => {
    e.preventDefault();

    const cipherKey = e.target.cipher_key.value;
    const cipherKeyAsInt = parseInt(cipherKey)

    if (!Number.isNaN(cipherKeyAsInt) && cipherKeyAsInt >= 0 && cipherKeyAsInt <= 25) {
      this.setState({
        cipherKeyFormError: {
          cipherKey: ''
        },
        loading: true
      });

      try {
        await axios.post('/store-cipher-key', {
          email: this.state.registrationValues.email,
          key: cipherKey
        });

        this.setState({
          formMode: FormModes.Success,
          loading: false
        });
      } catch (error) {
        console.log(error);
        this.setState({
          loading: false,
          cipherKeyFormError: {
            cipherKey: 'Your cipher key could not be saved, please try again.'
          }
        });
      }
    } else {
      this.setState({
        cipherKeyFormError: {
          cipherKey: 'Cipher key should be an integer between 0 and 25.'
        }
      });
    }
  }

  redirectUserToLogin = () => this.setState({ redirectToLogin: true });

  render() {
    const {
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      password: passwordError,
    } = this.state.registrationFormErrors;

    const { otp: otpError } = this.state.otpFormErrors;

    const { question: questionError, answer: answerError } =
      this.state.securityQuestionsFormErrors;

    const { cipherKey: cipherKeyError } = this.state.cipherKeyFormError;

    if (this.state.redirectToLogin) {
      return <Navigate to='/login' />;
    }

    if (this.state.formMode === FormModes.Success) {
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
          <Alert variant='success'>
            Your account has been created successfully. Please{' '}
            <Alert.Link onClick={this.redirectUserToLogin}>Log In</Alert.Link>{' '}
            to start using our services!
          </Alert>
        </Container>
      );
    }

    if (this.state.formMode === FormModes.CipherKey) {
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
          <h1>Caesar Cipher Key</h1>
          <p>Please input an integer value between 0 and 25 as your key.</p>
          <Container style={{ width: '50%', textAlign: 'left' }}>
            <Form
              method='POST'
              onSubmit={this.handleCipherKeyFormSubmission}
              style={{ marginTop: '32px' }}
            >
              <Form.Group style={{ marginBottom: '24px' }}>
                <FloatingLabel controlId='cipher_key' label='Your Cipher Key'>
                  <Form.Control
                    name='cipher_key'
                    type='text'
                    placeholder='Your Cipher Key'
                  />
                  {cipherKeyError && (
                    <Form.Text style={{ color: 'red', fontWeight: 'bold' }}>
                      *{cipherKeyError}
                    </Form.Text>
                  )}
                </FloatingLabel>
              </Form.Group>
              <div className='d-grid' style={{ margin: '2vh 0vh' }}>
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
                  Save Cipher Key
                </Button>
              </div>
            </Form>
          </Container>
        </Container>
      );
    }

    // security question UI
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
          <h1>Security Questions</h1>
          <p>Please select a security question for your account</p>
          <Container style={{ width: '50%', textAlign: 'left' }}>
            <Form
              method='POST'
              onSubmit={this.handleSecurityQuestionsFormSubmission}
              style={{ marginTop: '32px' }}
            >
              <Form.Group style={{ marginBottom: '24px' }}>
                <FloatingLabel
                  controlId='securityQuestionLabel'
                  label='Question'
                >
                  <Form.Select name='question' defaultValue='default'>
                    <option value='default'>Select a security question</option>
                    {securityQuestions.map((question, index) => {
                      return (
                        <option key={index} value={question}>
                          {question}
                        </option>
                      );
                    })}
                  </Form.Select>
                  {questionError && (
                    <Form.Text style={{ color: 'red', fontWeight: 'bold' }}>
                      {questionError}
                    </Form.Text>
                  )}
                </FloatingLabel>
              </Form.Group>
              <Form.Group style={{ marginBottom: '24px' }}>
                <FloatingLabel controlId='answerLabel' label='Your Answer'>
                  <Form.Control
                    name='answer'
                    type='text'
                    placeholder='Your Answer'
                  />
                  {answerError && (
                    <Form.Text style={{ color: 'red', fontWeight: 'bold' }}>
                      *{answerError}
                    </Form.Text>
                  )}
                </FloatingLabel>
              </Form.Group>
              <div className='d-grid' style={{ margin: '2vh 0vh' }}>
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
                  Save Security Question
                </Button>
              </div>
            </Form>
          </Container>
        </Container>
      );
    }

    // verify OTP form UI
    if (this.state.formMode === FormModes.OtpVerification) {
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
          <h1>Account Verification</h1>
          <Container style={{ width: '50%', textAlign: 'left' }}>
            <p align='center'>
              An OTP has been sent to your email:{' '}
              {this.state.registrationValues.email}
            </p>
            <Form
              method='POST'
              onSubmit={this.handleOtpVerificationSubmit}
              style={{ marginTop: '32px' }}
            >
              <Form.Group style={{ marginBottom: '24px' }}>
                <FloatingLabel controlId='otpLabel' label='Enter OTP'>
                  <Form.Control
                    name='otp'
                    type='text'
                    placeholder='Enter OTP'
                  />
                  {otpError && (
                    <Form.Text
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        color: 'red',
                        fontWeight: 'bold',
                      }}
                    >
                      {otpError}
                    </Form.Text>
                  )}
                </FloatingLabel>
              </Form.Group>
              <div className='d-grid' style={{ margin: '2vh 0vh' }}>
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
                  Verify Account
                </Button>
              </div>
            </Form>
          </Container>
        </Container>
      );
    }

    // registration form UI
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
        <h2>Register to Create Account!</h2>
        <Container style={{ width: '50%', textAlign: 'left' }}>
          <Form
            method='POST'
            onSubmit={this.handleRegisterSubmit}
            style={{ marginTop: '32px' }}
          >
            <Form.Group style={{ marginBottom: '24px' }}>
              <FloatingLabel controlId='firstNameLabel' label='First Name'>
                <Form.Control
                  name='firstName'
                  type='text'
                  placeholder='First Name'
                />
                {firstNameError && (
                  <Form.Text style={{ color: 'red', fontWeight: 'bold' }}>
                    *{firstNameError}
                  </Form.Text>
                )}{' '}
              </FloatingLabel>
            </Form.Group>
            <Form.Group style={{ marginBottom: '24px' }}>
              <FloatingLabel controlId='lastNameLabel' label='Last Name'>
                <Form.Control
                  name='lastName'
                  type='text'
                  placeholder='Last Name'
                />
                {lastNameError && (
                  <Form.Text style={{ color: 'red', fontWeight: 'bold' }}>
                    *{lastNameError}
                  </Form.Text>
                )}
              </FloatingLabel>
            </Form.Group>
            <Form.Group style={{ marginBottom: '24px' }}>
              <FloatingLabel controlId='emailLabel' label='Email ID'>
                <Form.Control
                  name='email'
                  type='email'
                  placeholder='Email ID'
                />
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
            <div className='d-grid' style={{ margin: '2vh 0vh' }}>
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
                Register
              </Button>
            </div>
          </Form>
        </Container>
      </Container>
    );
  }
}

export default RegisterForm;
