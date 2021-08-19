import { check } from 'express-validator';

export default blogValidator = [
    check('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    check('content')
        .not()
        .isEmpty()
        .withMessage('Content is required and should be at least 20 characters long'),
    check('categories')
        .not()
        .isEmpty()
        .withMessage('Pick a category'),
    check('tags')
        .not()
        .isEmpty()
        .withMessage('Pick a tag'),
];