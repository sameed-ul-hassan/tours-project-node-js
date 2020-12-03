const { promisify } = require('util');
const User = require('../models/User');
const asynHandler = require('../utils/asynHandler');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP,
    });
};

const createAndSendToken = (user, code, res) => {
    const token = generateToken(user._id);
    res.status(code).json({
        status: 'success',
        token,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

exports.signUp = asynHandler(async(req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });

    createAndSendToken(newUser, 200, res);
});

exports.login = asynHandler(async(req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createAndSendToken(user, 200, res);
});

exports.auth = asynHandler(async(req, res, next) => {
    let token;
    // check if token provided
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(new AppError('You are not loggedin !', 401));

    // verify token
    const decodedToken = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
    );

    //check if user still exists
    const user = await User.findById(decodedToken.id);
    if (!user) {
        return next(
            new AppError('The user belong to this token no longer exist!', 401)
        );
    }

    // check if user updated his password after token issued
    if (user.changedPasswordAfter(decodedToken.iat)) {
        return next(
            new AppError(
                'User recently changed password! Please login again',
                401
            )
        );
    }
    // Grant Access
    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You are not authorized for this action', 403)
            );
        }

        next();
    };
};

exports.forgotPassword = asynHandler(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with this email', 404));
    }

    const resetToken = user.createPasswordResetToken();
    // validateBeforeSave this will skip all validations on user document
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password ? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl} \n if you didn't forget your password, ignor this email!.`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token valid only for 10 minutes',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to provided email',
        });
    } catch (error) {
        user.createPasswordResetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'There was an error while sending email, Try again later',
                500
            )
        );
    }
});
exports.resetPassword = asynHandler(async(req, res, next) => {
    // Get user based on token
    const hashedTooken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedTooken,
        resetTokenExpire: { $gt: Date.now() },
    });
    // set password if token is valid
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();
    // update changePasswordAt Property

    // send JWT token to user
    createAndSendToken(user, 200, res);
});

exports.updatePassword = asynHandler(async(req, res, next) => {
    // Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // Check if current password is correct
    if (!(await user.correctPassword(req.body.password, user.password))) {
        return next(new AppError('Old password is not correct', 401));
    }

    // Update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // Send JWT token
    createAndSendToken(user, 200, res);
});