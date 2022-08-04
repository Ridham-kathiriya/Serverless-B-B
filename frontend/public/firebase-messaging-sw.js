// Scripts for firebase and firebase messaging
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js'
);

const firebaseConfig = {
  apiKey: 'AIzaSyDaAPyPstHvaxP1f9OBOtQCXtBbhjzdqvc',
  authDomain: 'serverlessbnb-354422.firebaseapp.com',
  projectId: 'serverlessbnb-354422',
  storageBucket: 'serverlessbnb-354422.appspot.com',
  messagingSenderId: '17476169033',
  appId: '1:17476169033:web:480b7f8ca021bc34c1be98',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
