const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

exports.main = async (event) => {
  try {
    const messageObject = JSON.parse(
      Buffer.from(event.data, 'base64').toString()
    );
    console.log(messageObject);

    const registrationToken = (
      await db.collection('notifications').doc(messageObject.customer_id).get()
    ).data().token;

    const message = {
      notification: {
        body: messageObject.message,
      },
      token: registrationToken,
    };

    admin
      .messaging()
      .send(message)
      .then(async () => {
        const ref = db
          .collection('notifications')
          .doc(messageObject.customer_id);
        let notifications = (await ref.get()).data().notifications;
        notifications.unshift({
          message: messageObject.message,
          timestamp: new Date().toUTCString(),
        });
        await ref.update({ notifications: notifications });
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  } catch (e) {
    console.log(e);
  }
};
