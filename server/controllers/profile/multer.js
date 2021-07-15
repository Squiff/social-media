const path = require('path');
const { admin } = require('../../firebase');
const multer = require('multer');
const googleCloudStorage = require('../../middleware/googleCloudStorage');
const User = require('../../models/User');
const { nanoid } = require('nanoid');

const storage = new googleCloudStorage({
    bucket: admin.storage().bucket(),
    destination: destination,
});

function destination(req, file, cb) {
    const ext = path.extname(file.originalname);
    const newFileName = nanoid();

    cb(null, `profile/${newFileName}${ext}`);
}

function fileFilter(req, file, cb) {
    // accept the file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') return cb(null, true);

    // reject file
    const error = new Error(`Cannot accept files of type ${file.mimetype}`);
    error.statusCode = 400;
    cb(error, false);
}

const multerExport = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1 },
    fileFilter: fileFilter,
});

module.exports = multerExport;
