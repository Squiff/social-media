// const { firestore } = require('firebase-admin');
const admin = require('firebase-admin');
const firebase = require('firebase');

/*---- INITIALIZE Admin -----*/
const serviceAccount = require('./firebaseConfig.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = { firebase, admin };
