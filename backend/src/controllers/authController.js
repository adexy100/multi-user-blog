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