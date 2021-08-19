import { check } from 'express-validator';

export default channelValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('content')
        .not()
        .isEmpty()
        .withMessage('Content is required and should be at least 20 characters long'),
    check('categories')
        .not()
        .isEmpty()
        .withMessage('Pick a category'),
];