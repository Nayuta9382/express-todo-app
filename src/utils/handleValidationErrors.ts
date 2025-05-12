import { Request, Response } from 'express';
import { ValidationError, validationResult } from 'express-validator';

// バリデーションエラーがあればリダイレクトする関数(bodyのセッションを保存するかのフラグ)
export const handleValidationErrors = (req: Request,res: Response,redirectPath: string,sessionRetFlg = false): boolean => {
    
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        const errorMessages: Record<string, string[]> = {};
        const errorArray = errors.array();
        
        errorArray.forEach((error: ValidationError) => {
            if ('path' in error && typeof error.path === 'string') {
                const fieldName = error.path;

                if (!errorMessages[fieldName]) {
                    errorMessages[fieldName] = [];
                }

                errorMessages[fieldName].push(error.msg);
            }
        });

        req.session.errors = errorMessages;
        req.session.oldInput = req.body;

        res.redirect(redirectPath);
        return true;
    }
    // セッションに入力内容を保存する
    if(sessionRetFlg){
        req.session.oldInput = req.body;

    }

    return false; // エラーなし
};
