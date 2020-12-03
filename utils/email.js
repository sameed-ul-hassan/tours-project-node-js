const nodemailer = require('nodemailer');
const { model } = require('../models/User');
const { options } = require('../routes/tourRoutes');

const sendEmail = async(options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    // Define email options
    const mailOptions = {
        from: 'Sameed Ul Hassan <sameedh5@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    // send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;