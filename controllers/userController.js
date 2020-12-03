const User = require('../models/User');
const AppError = require('../utils/appError');
const asynHandler = require('../utils/asynHandler');
exports.getAllUsers = (req, res) => {
    res.status(200).json({
        status: 'fail',
        message: 'Not defined',
    });
};

exports.getUser = (req, res) => {
    res.status(200).json({
        status: 'fail',
        message: 'Not defined',
    });
};

exports.addUser = (req, res) => {
    res.status(200).json({
        status: 'fail',
        message: 'Not defined',
    });
};

exports.updateUser = (req, res) => {
    res.status(200).json({
        status: 'fail',
        message: 'Not defined',
    });
};

exports.deleteUser = (req, res) => {
    res.status(200).json({
        status: 'fail',
        message: 'Not defined',
    });
};

exports.updateMe = asynHandler(async(req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return new AppError('This route is not for password update', 400);

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        message: 'Not defined',
    });
});