// const { firestore } = require('firebase-admin');
const admin = require('firebase-admin');
const firebase = require('firebase');

/*---- get config files ---*/
const serviceAccount = require('./firebaseAdmin.json');
const firebaseConfig = require('./firebase.json');

/*---- INITIALIZE Admin ---*/
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: firebaseConfig.storageBucket,
});

admin.firestore().settings({ ignoreUndefinedProperties: true });

/*---- INITIALIZE Firebase ---*/
firebase.initializeApp(firebaseConfig);

module.exports = { firebase, admin };
