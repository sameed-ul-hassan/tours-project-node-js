const express = require('express');
const morgan = require('morgan'); //request logger
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const rateLimit = require('express-rate-limit'); //for limiting number of requests for an ip
const helmet = require('helmet'); //set security http headers
const mongoSanitize = require('express-mongo-sanitize'); //prevent mongo query injection
const xss = require('xss-clean');
const hpp = require('hpp'); //prevent perament polution

const app = express();
/*=================================
            MIDDLEWARES             
=================================*/
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP , please try again in an hour',
});

app.use('/api', limiter);

//middleware to add body property on request object
app.use(
    express.json({
        limit: '10kb',
    })
);

// Data sanitization
app.use(mongoSanitize());
// prevent malicious html/js scripts
app.use(xss());

app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

app.use(express.static(`${__dirname}/public`)); //serve files from public folder
/*=================================
            Routes             
=================================*/

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`), 404);
});
app.use(globalErrorHandler);

module.exports = app;