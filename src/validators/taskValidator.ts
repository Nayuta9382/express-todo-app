import { body } from 'express-validator';

// タスクの追加・編集のバリデーション
export const validateTask = [
    body('title')
        .notEmpty().withMessage('タイトルは必須です')
        .isLength({ max: 50 }).withMessage('タイトルは50文字以内にしてください'),

    body('detail')
        .optional()
        .isLength({ max: 250 }).withMessage('詳細は250文字以内にしてください'),

    body('deadline')
    .notEmpty().withMessage('期限は必須です')
    .isISO8601().withMessage('期限は日付形式で入力してください')
    .custom((value) => {
        const today = new Date();
        const deadline = new Date(value);

        // 今日の「日付部分のみ」を取得（時刻を 00:00 に）
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // 入力された期限も「日付部分のみ」に変換
        const deadlineDateOnly = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

        if (deadlineDateOnly < todayDateOnly) {
            throw new Error('期限は現在の日付以降でなければなりません');
        }
        return true;
    })

];