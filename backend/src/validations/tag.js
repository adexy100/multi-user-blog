import { check } from 'express-validator';

export default linkValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('content')
        .not()
        .isEmpty()
        .withMessage('Content is required and should be at least 20 characters long'),
    check('parent')
        .not()
        .isEmpty()
        .withMessage('Pick a Parent category'),
];