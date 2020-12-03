const AppError = require('../utils/appError');

const handleCastErrorDb = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldError = (error) => {
    const message = `Duplicate field value: ${error.keyValue.name} , try another one.`;
    return new AppError(message, 400);
};

const handleValdationError = (error) => {
    const errors = Object.values(error.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJwtError = () => new AppError('Invalid Token! Login again', 401);

const handleJwtExpireError = () =>
    new AppError('Token has been expired! Login again', 401);

const sendDevErr = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: error.stack,
        error: error,
    });
};

const sendProdErr = (error, res) => {
    // Operational ,trusted error: send message to client
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
        // Programming and unknown errors: don't send to client
    } else {
        // log in console
        console.error('Error:', error);
        // send generic response to client
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendDevErr(error, res);
    } else if (process.env.NODE_ENV === 'production') {
        let errCopy = {...error };
        if (error.name === 'CastError') errCopy = handleCastErrorDb(errCopy);
        if (error.code === 11000) errCopy = handleDuplicateFieldError(errCopy);
        if (error.name === 'ValidationError')
            errCopy = handleValdationError(errCopy);
        if (error.name === 'JsonWebTokenError') errCopy = handleJwtError();
        if (error.name === 'TokenExpiredError')
            errCopy = handleJwtExpireError();
        sendProdErr(errCopy, res);
    }
};