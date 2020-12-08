const Review = require('../models/Review');
const asynHandler = require('../utils/asynHandler');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

exports.setTourUserId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.getAllReviews = handlerFactory.getAll(Review);

exports.getReview = handlerFactory.getOne(Review);

exports.addReviews = handlerFactory.createOne(Review);

exports.updateReview = handlerFactory.updateOne(Review);

exports.deleteReview = handlerFactory.deleteOne(Review);