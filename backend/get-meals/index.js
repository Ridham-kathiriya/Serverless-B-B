const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

exports.main = async (req, res) => {
  try {
    const mealSnapshot = await db.collection('meals').get();
    const meals = [];
    mealSnapshot.forEach((doc) => {
      meals.push({
        id: doc.id,
        data: doc.data(),
      });
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '1800');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'PUT, POST, GET, DELETE, PATCH, OPTIONS'
    );
    res.status(200).json(meals);
  } catch (e) {
    res.status(500).send(e);
  }
};
