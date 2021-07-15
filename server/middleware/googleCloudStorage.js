/** Custom storage for multer middleware
 *
 * https://github.com/expressjs/multer/blob/master/StorageEngine.md
 */
class googleCloudStorage {
    constructor(options) {
        // google cloud bucket: admin.storage().bucket()
        this.bucket = options.bucket;
        // destination func of signature (req, file, (err, path)=>{})
        this.destination = options.destination;
    }

    _handleFile(req, file, cb) {
        this.destination(req, file, (err, path) => {
            if (err) return cb(error);

            this.saveToCloudStorage(file, path, cb);
        });
    }

    saveToCloudStorage(file, path, cb) {
        const bucket = this.bucket;
        const fileRef = bucket.file(path);
        const writeStream = fileRef.createWriteStream({ resumable: false, metadata: {} });

        file.stream
            .pipe(writeStream)
            .on('error', cb)
            .on('finish', () => {
                cb(null, {
                    path: path,
                    size: writeStream.bytesWritten,
                    publicUrl: fileRef.publicUrl(),
                });
            });

        // // consume the stream so event fires
        // file.stream
        //     .on('data', (chunk) => {})
        //     .on('end', () => {
        //         cb(null, { path });
        //     })
        //     .on('error', cb);
    }

    _removeFile(req, file, cb) {
        const bucket = this.bucket;
        const fileRef = bucket.file(file.path);

        fileRef.delete({ ignoreNotFound: true }, cb);
        // cb(null);
    }
}

module.exports = googleCloudStorage;
