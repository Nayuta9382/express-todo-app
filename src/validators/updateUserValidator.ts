import { body } from 'express-validator';

// タスクの追加・編集のバリデーション
export const validateUpdateUser = [
    body('name')
        .notEmpty().withMessage('名前は必須です')
        .isLength({ max: 50 }).withMessage('名前は50文字以内にしてください'),

];