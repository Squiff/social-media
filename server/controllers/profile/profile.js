const { string, number } = require('joi');
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
async function getUserProfile(req, res) {
    const { username } = req.params;
    const user = await User.getByUserName(username);

    if (!user) return res.status(404).json({ message: 'user not found' });

    res.json({ userid: user.id, ...user.data() });
}

async function updateProfile(req, res) {
    const { description, location, website } = req.body;
    const updatedProfile = { description, location, website };

    await User.update(req.idToken.uid, updatedProfile);
    res.json({ success: true, message: 'profile updated' });
}

module.exports = { setImage, getUserProfile, updateProfile };
