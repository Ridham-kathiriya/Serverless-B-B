import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDaAPyPstHvaxP1f9OBOtQCXtBbhjzdqvc',
  authDomain: 'serverlessbnb-354422.firebaseapp.com',
  projectId: 'serverlessbnb-354422',
  storageBucket: 'serverlessbnb-354422.appspot.com',
  messagingSenderId: '17476169033',
  appId: '1:17476169033:web:480b7f8ca021bc34c1be98',
};

initializeApp(firebaseConfig);
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const messaging = getMessaging(firebaseApp);
export const fetchToken = (setTokenFound, currentUser) => {
  return getToken(messaging, {
    vapidKey:
      'BM1LZsJ_7TW4PfRZo_WN9Eq0p7cuM5BGt0AooYXvgbr_JedFbS_kwzMsO6INruP9IETKOTkhmKStk8pnT5zX1_Y',
  })
    .then(async (currentToken) => {
      if (currentToken) {
        setTokenFound(true);
        const ref = doc(db, 'notifications', currentUser);
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          await setDoc(ref, { token: currentToken }, { merge: true });
        } else {
          await setDoc(ref, {
            token: currentToken,
            notifications: [],
            invoices: [],
          });
        }
      } else {
        console.log(
          'No registration token available. Request permission to generate one.'
        );
        setTokenFound(false);
      }
    })
    .catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
