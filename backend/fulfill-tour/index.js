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

exports.main = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '1800');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'PUT, POST, GET, DELETE, PATCH, OPTIONS'
  );
  try {
    const subscription = pubSubClient.subscription('tour_order_sub');
    const messageHandler = async (message) => {
      let messageReceived = JSON.parse(message.data);
      message.ack();
      await db
        .collection('tour_booking')
        .doc(messageReceived.order_id)
        .update({ status: 'Delivered' });
      const price = (
        await db
          .collection('tours')
          .doc(messageReceived.tour_id.toString())
          .get()
      ).data().tour_price;
      await db
        .collection('notifications')
        .doc(messageReceived.customer_id)
        .update({
          invoices: admin.firestore.FieldValue.arrayUnion({
            order_id: messageReceived.order_id,
            order_type: 'Tour',
            status: 'Unpaid',
            amount: price * messageReceived.tour_qty,
          }),
        });
      await publishMessage(pubSubClient, 'notifications', {
        customer_id: messageReceived.customer_id,
        message: `Tour Order Fulfilled & Invoice Generated, Order ID: ${messageReceived.order_id}`,
      });
    };

    subscription.on('message', messageHandler);
    setTimeout(() => {
      subscription.removeListener('message', messageHandler);
      return res.status(200).json({
        success: true,
        message: 'Orders Received',
      });
    }, 30 * 1000);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};
