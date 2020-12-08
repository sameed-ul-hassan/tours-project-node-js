const Tour = require('../models/Tour');
const ApiFilters = require('../utils/apiFilters');
const asynHandler = require('../utils/asynHandler');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getToursWithin = asynHandler(async(req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(new AppError('Please provide in lat,long format', 400));
    }

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const tour = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ],
            },
        },
    });

    res.status(200).json({
        status: 'success',
        results: tour.length,
        data: tour,
    });
});

exports.getTourInDistance = asynHandler(async(req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(new AppError('Please provide in lat,long format', 400));
    }

    const tour = await Tour.aggregate([{
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: tour,
    });
});

exports.getAllTours = handlerFactory.getAll(Tour);

exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });

exports.addTour = handlerFactory.createOne(Tour);

exports.updateTour = handlerFactory.updateOne(Tour);

exports.deleteTour = handlerFactory.deleteOne(Tour);

exports.toursStats = asynHandler(async(req, res, next) => {
    const tour = await Tour.aggregate([{
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: '$difficulty', // _id can be any filed name
                numTours: { $sum: 1 },
                numRating: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: {
                avgPrice: 1,
            },
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.monthlyPlan = asynHandler(async(req, res, next) => {
    const year = parseInt(req.params.year);
    const plan = await Tour.aggregate([{
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursStart: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: {
                _id: 0, //Project will remove _id field from all objects
            },
        },
        {
            $sort: {
                numToursStart: -1, //-1 for DESC and 1 for ASC
            },
        },
        {
            $limit: 12,
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});