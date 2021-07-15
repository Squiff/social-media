const User = require('../../models/User');

/** Update currently authenticated users profile image */
async function setImage(req, res) {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'upload file is required' });
    }

    await User.update(req.idToken.uid, { profileImg: req.file.path });
    res.json({ success: true, url: req.file.publicUrl });
}

/** get the currently authenticated users profile */
async function getCurrentUserProfile(req, res) {
    const user = await User.get(req.idToken.uid);
    res.json(user);
}

async function updateProfile(req, res) {
    const { description, location, website } = req.body;
    const updatedProfile = { description, location, website };

    await User.update(req.idToken.uid, updatedProfile);
    res.json({ success: true, message: 'profile updated' });
}

module.exports = { setImage, getCurrentUserProfile, updateProfile };
