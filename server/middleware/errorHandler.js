/** Error handling middleware. Must be added AFTER all other routes */
function errorHandler(error, req, res, next) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ message: error.message, errorcode: error.code });
}

module.exports = errorHandler;
