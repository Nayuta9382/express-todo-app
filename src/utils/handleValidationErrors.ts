import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// バリデーションエラーがあればリダイレクトする関数
export const handleValidationErrors = (req: Request,res: Response,redirectPath: string): boolean => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages: Record<string, string> = {};
        const errorArray = errors.array();

        errorArray.forEach((error) => {
            const fieldName = (error as any).path || (error as any).param;
            errorMessages[fieldName] = error.msg;
        });

        // セッションに保存してリダイレクト
        req.session.errors = errorMessages;
        req.session.oldInput = req.body;
        
        res.redirect(redirectPath);
        return true; // 処理終了を示す
    }

    return false; // エラーなし
};
