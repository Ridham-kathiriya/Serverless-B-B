const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const firestore = admin.firestore();

const COLLECTION_NAME = 'security-questions';

exports.validateSecurityQuestionAnswer = async (req, res) => {
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
    const email = req.body.email;
    const answer = req.body.answer;
  
    try {
      const docRef = await firestore.collection(COLLECTION_NAME).doc(email).get();
      if (docRef.exists) {
        const doc = await docRef.data();
        const correctAnswer = doc.answer;
    
        if (answer === correctAnswer) {
          return res.status(200).send('SUCCESS');
        } else {
          throw new Error('Incorrect answer.');
        }
      } else {
        throw new Error('No record exists for the given email ID.');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send(error.message);
    }
  }
};
