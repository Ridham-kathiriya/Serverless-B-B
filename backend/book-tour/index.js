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
    const ref = db
      .collection('tour_availability')
      .doc(new Date().toISOString().split('T')[0]);
    let flag = false;
    let availability = (await ref.get()).data().availability;
    availability.find((a) => {
      if (a.tour_id === +req.body.id) {
        if (a.available_qty < req.body.quantity) {
          res.status(200).json({
            success: false,
            message: `Insufficent Slots, Available:${a.available_qty}`,
          });
        } else {
          a.available_qty = a.available_qty - req.body.quantity;
          flag = true;
        }
      }
    });
    if (flag) {
      let orderObj = {
        customer_id: req.body.user,
        date: new Date().toISOString().split('T')[0],
        status: 'Placed',
        tour_id: +req.body.id,
        tour_qty: +req.body.quantity,
      };
      const response = await db.collection('tour_booking').add(orderObj);
      await ref.update({ availability: availability });
      orderObj.order_id = response.id;
      const notificationRef = db.collection('notifications').doc(req.body.user);
      let notifications = (await notificationRef.get()).data().notifications;
      notifications.unshift({
        message: `Tour Order Placed, Order ID: ${response.id}`,
        timestamp: new Date().toUTCString(),
      });
      await notificationRef.update({ notifications: notifications });
      await publishMessage(pubSubClient, 'tour_order', orderObj);
      res.status(200).json({
        success: true,
        message: `Tour Order Placed, Order ID: ${response.id}`,
      });
    }
    res.status(200).json({ success: false, message: 'Something Went Wrong!' });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};
