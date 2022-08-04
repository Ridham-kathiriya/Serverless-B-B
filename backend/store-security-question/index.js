const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const firestore = admin.firestore();

const COLLECTION_NAME = 'security-questions';

exports.storeSecurityQuestion = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '1800');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'PUT, POST, GET, DELETE, PATCH, OPTIONS'
    );
    return res.status(204).send('');
  } else {
    const question = req.body.question;
    const answer = req.body.answer;
    const email = req.body.email;

    try {
      await firestore.collection(COLLECTION_NAME).doc(email).set({
        question,
        answer
      });

      return res.status(200).send('Added security questions successfully.');
    } catch (error) {
      console.error(error);
      return res.status(500).send(error.message);
    }
  }
};
