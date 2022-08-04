import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import axios from '../Config/AxiosConfig';

export const userLogInEvent = new Event('user-logged-in');
const userLogOutEvent = new Event('user-logged-out');

const USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;

const poolData = {
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID
}

const userPool = new CognitoUserPool(poolData);

export const registerUser = (email, password, firstName, lastName) => {
  return new Promise((resolve, reject) => {
    const attributes = [];

    const emailAttribute = new CognitoUserAttribute({
      Name: 'email',
      Value: email
    });

    const firstNameAttribute = new CognitoUserAttribute({
      Name: 'given_name',
      Value: firstName
    });

    const lastNameAttribute = new CognitoUserAttribute({
      Name: 'family_name',
      Value: lastName
    });

    attributes.push(emailAttribute, firstNameAttribute, lastNameAttribute);

    userPool.signUp(email, password, attributes, null, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result.user);
    });
  });
};

const getCognitoUserFromEmail = (email) => {
  const userData = {
    Username: email,
    Pool: userPool
  };

  return new CognitoUser(userData);
}

export const validateEmailOTP = (email, otp) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCognitoUserFromEmail(email);
    cognitoUser.confirmRegistration(otp, true, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
}

export const resendOTP = (email) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = getCognitoUserFromEmail(email);
    cognitoUser.resendConfirmationCode((error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
}

export const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    const cognitoUser = getCognitoUserFromEmail(email);
    cognitoUser.authenticateUser(authenticationDetails, {
      onFailure: (error) => reject(error),
      onSuccess: () => {
        document.dispatchEvent(userLogInEvent);
        resolve(true);
      }
    });
  });
}

export const isUserSessionActive = () => {
  return new Promise((resolve, reject) => {
    try {
      const currentUser = userPool.getCurrentUser();

      currentUser.getSession((error, session) => {
        if (error) {
          console.error(error);
          reject(error);
        }

        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export const getCurrentUserAttributes = () => {
  return new Promise((resolve, reject) => {
    try {
      const currentUser = userPool.getCurrentUser();

      currentUser.getSession((error, session) => {
        if (error) {
          reject(error);
        }

        currentUser.getUserAttributes((error, attributes) => {
          if (error || attributes === null) {
            return reject(error);
          }

          const userAttributes = new Map();

          for (let i = 0; i < attributes.length; i++) {
            const { Name, Value } = attributes[i];

            if (Name === 'sub') {
              continue;
            }

            userAttributes.set(Name, Value);
          }

          resolve(Object.fromEntries(userAttributes));
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

export const logoutUser = () => {
  try {
    const currentUser = userPool.getCurrentUser();

    currentUser.getSession((error) => {
      if (error) throw error;

      currentUser.getUserAttributes((error, attributes) => {
        if (error) throw error;

        const emailAttribute = attributes.find((attribute) => attribute.Name === 'email');
        const email = emailAttribute.Value;

        currentUser.globalSignOut({
          onSuccess: async () => {
            localStorage.removeItem('security-question-answer-status');
            localStorage.removeItem('cipher-key-verification-status');
            document.dispatchEvent(userLogOutEvent);
            await axios.post('/set-user-status', {
              email,
              status: false
            });
            await axios.post('/update_session_timestamp/', {
              email: email,
            })
            window.location.assign('/login');
          },
          onFailure: (error) => {
            throw error;
          }
        });
      });
    });
  } catch (error) {
    console.error(error);
  }
}
