import { body } from 'express-validator';

// タスクの追加・編集のバリデーション
export const validateSignup = [
    body('id')
        .notEmpty().withMessage('IDは必須です')
        .isLength({ max: 50 }).withMessage('IDは50文字以内にしてください'),

    body('name')
        .notEmpty().withMessage('名前は必須です')
        .isLength({ max: 50 }).withMessage('名前は50文字以内にしてください'),
    body('password')
        .notEmpty().withMessage('パスワードは必須です')
        .isLength({ min: 8 }).withMessage('パスワードは8文字以上にしてください')
        .isLength({ max: 50 }).withMessage('パスワードは50文字以内にしてください'),
    body('confirmPassword')
        .notEmpty().withMessage('パスワード確認は必須です')
        .isLength({ max: 50 }).withMessage('パスワード確認は50文字以内にしてください'),
];