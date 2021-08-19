const User = require('../models/user');
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { registerEmailParams, forgotPasswordEmailParams } = require('../helpers/sendMail');
const _ = require('lodash');
const shortId = require('shortid');
import config from '../config/config.js'

AWS.config.update(config.aws);

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

export default register = (req, res) => {
    // console.log('REGISTER CONTROLLER', req.body);
    const { firstname, lastname, email, password } = req.body;
    // check if user exists in our db
    User.findOne({ email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is taken'
            });
        }
        // generate token with user name email and password
        const token = jwt.sign({ firstname, lastname, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, {
            expiresIn: '10m'
        });

        // send email
        const params = registerEmailParams(email, token);

        const sendEmailOnRegister = ses.sendEmail(params).promise();

        sendEmailOnRegister
            .then(data => {
                console.log('email submitted to SES', data);
                res.json({
                    message: `Email has been sent to ${email}, Follow the instructions to complete your registration`
                });
            })
            .catch(error => {
                console.log('ses email on register', error);
                res.json({
                    message: `We could not verify your email. Please try again`
                });
            });
    });
};

export default registerActivate = (req, res) => {
    const { token } = req.body;
    // console.log(token);
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(err, decoded) {
        if (err) {
            return res.status(401).json({
                error: 'Expired link. Try again'
            });
        }

        const { firstname, lastname, email, password } = jwt.decode(token);
        const username = shortId.generate();

        User.findOne({ email }).exec((err, user) => {
            if (user) {
                return res.status(401).json({
                    error: 'Email is taken'
                });
            }

            // register new user
            const newUser = new User({ firstname, lastname, username, email, password });
            newUser.save((err, result) => {
                if (err) {
                    return res.status(401).json({
                        error: 'Error saving user in database. Try later'
                    });
                }
                return res.json({
                  username: result.username,
	              firstname: result.firstname,
	              lastname: result.lastname,
	              email: result.email,
	              message: "Signup success",
                });
            });
        });
    });
};

export default login = (req, res) => {
    const { email, password } = req.body;
    // console.table({ email, password });
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please register.'
            });
        }
        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and password do not match'
            });
        }
        // generate token and send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { _id, firstname, lastname, username, email, role } = user;

        return res.json({
            token,
            user: { _id, firstname, lastname, username, email, role }
        });
    });
};

export default forgotPassword = (req, res) => {
    const { email } = req.body;
    // check if user exists with that email
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist'
            });
        }
        // generate token and email to user
        const token = jwt.sign({ name: user.name }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });
        // send email
        const params = forgotPasswordEmailParams(email, token);

        // populate the db > user > resetPasswordLink
        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.status(400).json({
                    error: 'Password reset failed. Try later.'
                });
            }
            const sendEmail = ses.sendEmail(params).promise();
            sendEmail
                .then(data => {
                    console.log('ses reset pw success', data);
                    return res.json({
                        message: `Email has been sent to ${email}. Click on the link to reset your password`
                    });
                })
                .catch(error => {
                    console.log('ses reset pw failed', error);
                    return res.json({
                        message: `We could not vefiry your email. Try later.`
                    });
                });
        });
    });
};

export default resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;
    if (resetPasswordLink) {
        // check for expiry
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, success) => {
            if (err) {
                return res.status(400).json({
                    error: 'Expired Link. Try again.'
                });
            }

            User.findOne({ resetPasswordLink }).exec((err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        error: 'Invalid token. Try again'
                    });
                }

                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Password reset failed. Try again'
                        });
                    }

                    res.json({
                        message: `Great! Now you can login with your new password`
                    });
                });
            });
        });
    }
};