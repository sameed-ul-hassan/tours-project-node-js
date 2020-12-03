const Tour = require('../models/Tour');
const ApiFilters = require('../utils/apiFilters');
const asynHandler = require('../utils/asynHandler');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = asynHandler(async(req, res, next) => {
    const filter = new ApiFilters(Tour.find(), req.query)
        .filter()
        .sort()
        .fields()
        .pagination();
    const tours = await filter.query;

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.getTour = asynHandler(async(req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        results: tour.length,
        data: {
            tour,
        },
    });
});

exports.addTour = asynHandler(async(req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    });
});

exports.updateTour = asynHandler(async(req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.deleteTour = asynHandler(async(req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

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