import { check } from 'express-validator';

export default categoryValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('content')
        .isLength({ min: 20 })
        .withMessage('Content is required and should be at least 20 characters long')
];