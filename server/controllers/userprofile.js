const path = require('path');
const { admin } = require('../firebase');

/*--------- Controllers -------------*/

async function uploadFile(req, res) {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'upload file is required' });
    }

    await User.update(req.user.uid, { profileImg: req.file.path });
    res.json({ success: true, url: req.file.publicUrl });
}

module.exports = { uploadFile, upload };
