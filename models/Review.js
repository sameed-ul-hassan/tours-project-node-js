const mongoose = require('mongoose');
const validator = require('validator');
const Tour = require('../models/Tour');

var reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belongs to a tour'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belongs to a user'],
    },
}, {
    toJSON: { virtual: true },
    toObject: { virtual: true },
});

// custom index
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// Query middlewares
reviewSchema.pre(/^find/, function(next) {
    // tourSchema.pre('find', function(next) {
    // this.populate({
    //     path: 'user',
    //     select: 'name photo',
    // }).populate({ path: 'tour', select: 'name' });
    this.populate({
        path: 'user',
        select: 'name photo',
    });
    next();
});

// Static Method
reviewSchema.statics.calcAvgRatings = async function(tourId) {
    const stats = await this.aggregate([{
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRatings,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0,
        });
    }
};

reviewSchema.post('save', function() {
    // this.tour point to current review
    // this.constructor points to Review constant
    this.constructor.calcAvgRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.review = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    await this.review.constructor.calcAvgRatings(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;