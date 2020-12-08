const asynHandler = require('../utils/asynHandler');
const AppError = require('../utils/appError');
const ApiFilters = require('../utils/apiFilters');

exports.getAll = (Model) =>
    asynHandler(async(req, res, next) => {
        // For nested tour review /:tourId/revies route
        let tourID = {};
        if (req.params.tourId) tourID = { tour: req.params.tourId };

        const filter = new ApiFilters(Model.find(tourID), req.query)
            .filter()
            .sort()
            .fields()
            .pagination();
        const doc = await filter.query;

        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: doc,
        });
    });

exports.getOne = (Model, popOptions) =>
    asynHandler(async(req, res, next) => {
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;
        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: doc,
        });
    });

exports.createOne = (Model) =>
    asynHandler(async(req, res, next) => {
        const doc = await Model.create(req.body);
        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        });
    });

exports.deleteOne = (Model) =>
    asynHandler(async(req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = (Model) =>
    asynHandler(async(req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError('No document found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: doc,
        });
    });