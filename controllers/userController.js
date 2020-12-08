const User = require('../models/User');
const AppError = require('../utils/appError');
const asynHandler = require('../utils/asynHandler');
const handlerFactory = require('./handlerFactory');

const filterObj = (body, ...fields) => {
    const newBody = {};
    Object.keys(body).forEach((el) => {
        if (fields.includes(el)) newBody[el] = body[el];
    });

    return newBody;
};

exports.addUser = (req, res) => {
    res.status(200).json({
        status: 'fail',
        message: 'Not defined',
    });
};

exports.getAllUsers = handlerFactory.getAll(User);

exports.getUser = handlerFactory.getOne(User);

exports.updateUser = handlerFactory.updateOne(User);

exports.deleteUser = handlerFactory.deleteOne(User);

exports.updateMe = asynHandler(async(req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return new AppError('This route is not for password update', 400);

    const filteredBody = filterObj(req.body, 'name', 'email');
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.deleteMe = asynHandler(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};