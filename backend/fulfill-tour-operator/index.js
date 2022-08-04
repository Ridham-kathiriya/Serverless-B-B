const admin = require('firebase-admin');
const { PubSub } = require('@google-cloud/pubsub');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();
const pubSubClient = new PubSub();

const publishMessage = async (pubSubClient, topicName, payload) => {
  const dataBuffer = Buffer.from(JSON.stringify(payload));
  const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
  return messageId;
};

exports.main = async (event) => {
  try {
    const messageObject = JSON.parse(
      Buffer.from(event.data, 'base64').toString()
    );
    await db
      .collection('tour_booking')
      .doc(messageObject.order_id)
      .update({ status: 'Delivered' });
    const price = (
      await db.collection('tours').doc(messageObject.tour_id.toString()).get()
    ).data().tour_price;
    await db
      .collection('notifications')
      .doc(messageObject.customer_id)
      .update({
        invoices: admin.firestore.FieldValue.arrayUnion({
          order_id: messageObject.order_id,
          order_type: 'Tour',
          status: 'Unpaid',
          amount: price * messageObject.tour_qty,
        }),
      });
    await publishMessage(pubSubClient, 'notifications', {
      customer_id: messageObject.customer_id,
      message: `Tour Order Delivered & Invoice Generated, Order ID: ${messageObject.order_id}`,
    });
    return res.status(200).json({
      success: true,
      message: `Tour Order ID: ${messageObject.order_id} Fulfilled`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};
