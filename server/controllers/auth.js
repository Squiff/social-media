const { firebase, admin } = require('../firebase');
const Joi = require('joi');
const { isSchema } = require('joi');

const db = admin.firestore();

async function signUp(req, res) {
    const { email, password, username } = req.body;

    // VALIDATION
    const { error, value } = signUpSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    const unameQuery = await db.collection('users').where('username', '==', username).get();

    if (!unameQuery.empty)
        return res.status(400).json({ success: false, message: 'username already exists' });

    try {
        // Create Auth and User Record
        const token = await createAuthUser({ email, password });

        const newUserRecord = {
            email,
            username,
            dateadded: admin.firestore.Timestamp.now(),
        };

        const user = await db.collection('users').add(newUserRecord);

        res.status(201).json({ success: true, message: `user signed up`, id: user.id, token });
    } catch (error) {
        let statusCode = 500;

        if (error.code === 'auth/email-already-in-use') statusCode = 400;

        console.log(error);

        return res
            .status(statusCode)
            .json({ success: false, message: error.message, errorcode: error.code });
    }
}

const signUpSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}/)
        .required(),
    username: Joi.string().required().min(1).trim(),
});

/** Create firebase authentication record for user and return an ID token (JWT) */
async function createAuthUser({ email, password }) {
    const userRecord = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const token = await userRecord.user.getIdToken();
    return token;
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        const userRecord = await firebase.auth().signInWithEmailAndPassword(email, password);
        const token = await userRecord.user.getIdToken();
        res.status(201).json({ success: true, message: `user logged in`, token });
    } catch (error) {
        let statusCode = 500;

        if (error.code === 'auth/wrong-password') statusCode = 403;
        if (error.code === 'auth/user-not-found') statusCode = 403;

        return res
            .status(statusCode)
            .json({ success: false, message: error.message, errorcode: error.code });
    }
}

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
        .regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}/)
        .required(),
});

module.exports = { signUp, login };
