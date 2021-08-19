const { firebase } = require('../firebase');
const Joi = require('joi');
const User = require('../models/User');

async function signUp(req, res) {
    const { email, password, username } = req.body;

    // VALIDATION
    const { error } = signUpSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    const usernameExists = await User.getByUserName(username);

    if (usernameExists)
        return res.status(400).json({ success: false, message: 'username already exists' });

    // Create Auth and User Record
    try {
        const authRecord = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const token = await authRecord.user.getIdToken();

        const user = new User({
            uid: authRecord.user.uid,
            email,
            username,
        });

        await user.add();

        res.status(201).json({ success: true, message: `user signed up`, token });
    } catch (error) {
        let statusCode = 500;

        if (error.code === 'auth/email-already-in-use') statusCode = 400;

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

async function login(req, res) {
    const { email, password } = req.body;

    // VALIDATION
    const { error } = loginSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    try {
        const authRecord = await firebase.auth().signInWithEmailAndPassword(email, password);
        const token = await authRecord.user.getIdToken();
        res.status(201).json({ success: true, message: `user logged in`, token });
    } catch (error) {
        let statusCode = 500;

        if (error.code === 'auth/wrong-password') statusCode = 401;
        if (error.code === 'auth/user-not-found') statusCode = 401;

        return res
            .status(statusCode)
            .json({ success: false, message: error.message, errorcode: error.code });
    }
}

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

module.exports = { signUp, login };
