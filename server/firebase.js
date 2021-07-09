// const { firestore } = require('firebase-admin');
const admin = require('firebase-admin');
const firebase = require('firebase');

/*---- INITIALIZE Admin -----*/
const serviceAccount = require('./firebaseAdmin.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

/*---- INITIALIZE Firebase -----*/
const firebaseConfig = require('./firebase.json');

firebase.initializeApp(firebaseConfig);

module.exports = { firebase, admin };
