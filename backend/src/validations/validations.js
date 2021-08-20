import { ErrorHandler } from './middlewares';
import Joi from 'joi';

const email = Joi
    .string()
    .email({
        minDomainSegments: 2,
        tlds: {
            allow: [ 'com', 'net' ]
        }
    })
    .required()
    .messages({
        'base': `Email should be a type of 'text'`,
        'empty': `Email cannot be an empty field`,
        'min': `Email should have a minimum length of {#limit}`,
        'required': `Email is a required field.`
    });

const password = Joi
    .string()
    .min(8)
    .max(50)
    .required()
    .messages({
        'base': `Password should be a type of 'text'`,
        'empty': `Password cannot be an empty field`,
        'min': `Password should have a minimum length of {#limit}`,
        'required': `Password is a required field`
    });
const username = Joi
    .string()
    .required()
    .messages({
        'base': 'Username should be of type "text"',
        'empty': `Username cannot be an empty field`,
        'min': `Username should have a minimum length of {#limit}`,
        'required': 'Username field is required'
    });

export const schemas = {
    loginSchema: Joi.object().keys({
        email,
        password
    }).options({
        abortEarly: false
    }),
    registerSchema: Joi.object().keys({
        email,
        password,
        username
    }).options({
        abortEarly: false
    }),
    forgotPasswordSchema: Joi.object().keys({
        email,
    }).options( {
        abortEarly: false
    }),
    resetPasswordSchema: Joi.object().keys({
        password,
    }).options( {
        abortEarly: false
    }),
    commentSchema: Joi.object().keys({
        body: Joi
            .string()
            .required()
            .messages({
                'base': 'Comment body should be of type "string"',
                'empty': `Comment body cannot be an empty field`,
                'required': 'Comment body field is required'
            }),
        post_id: Joi.string( ).empty(''),
        comment_id: Joi.string( ).empty('')
    }),
    editProfileSchema: Joi.object().keys({
        firstname: Joi.string().empty(''),
        lastname: Joi.string().empty(''),
        bio: Joi.string().empty(''),
        gender: Joi.string().empty(''),
    })
};

export const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.validate(req.body);

        if (result.error) {
            console.log(result.error);
            return next(new ErrorHandler(400, result.error.details[0].message))
        } else {
            if (!req.value) {
                req.value = {}
            }
            req.value[ 'body' ] = result.value;
            next();
        }
    }
}