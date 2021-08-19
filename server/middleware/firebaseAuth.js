const admin = require('firebase-admin');
const User = require('../models/User');

/** Extracts the bearer token from the authorization header.
 *  Adds user auth info under req.idToken if token is valid */
function firebaseAuth(options) {
    const getUser = options?.getUser;
    const skipOnFailure = options?.skipOnFailure;

    return async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || authHeader?.startsWith('Bearer') === false) {
            if (!skipOnFailure)
                return res.status(401).json({ success: false, message: 'unauthorized' });

            return next();
        }

        try {
            const authToken = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(authToken);
            req.idToken = decodedToken;
        } catch (error) {
            if (!skipOnFailure)
                return res
                    .status(401)
                    .json({ success: false, message: 'unauthorized', errorcode: error.code });

            return next();
        }

        // Attach additional user details to req.user. Requires additional database call
        if (getUser) {
            const userRecord = await User.get(req.idToken.uid).catch((err) => next(err));
            req.user = { uid: req.idToken.uid, ...userRecord.data() };
        }

        next();
    };
}

module.exports = firebaseAuth;
