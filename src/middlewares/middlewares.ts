import { Request, Response, NextFunction } from 'express';
import { selectTaskById } from '../models/taskModel';

// ログインしていなければログインページにリダイレクトする
export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next(); // ログイン済み → 次へ
    }
    res.redirect('/auth/login'); // 未ログイン → ログインページへリダイレクト
};


// user情報をすべてのビューに渡す
export const setUserToLocals = (req: Request, res: Response, next: NextFunction) => {
    res.locals.user = req.user;
    next();
};

// タスク処理への認可処理用のミドルウェア(表示するタスクがそのユーザの物かどうか)
export const authorizeTaskOwner  = async (req: Request, res: Response, next: NextFunction) =>{
    // ユーザーidの取得
    const userId = (req.user as any).id;
    // パスパラメータからタスクidを取得
    const taskId = parseInt(req.params.id);
    // タスク情報を取得
    const task = await selectTaskById(taskId);
   if (!task) {
    const error = new Error('存在しないページまたは、削除されたページです');
    (error as any).status = 404;
    return next(error);
    }

    if (task.user_id !== userId) {
        const error = new Error('このページにアクセスする権限がありません');
        (error as any).status = 403;
        return next(error);
    }

    next();

}

// エラーハンドリングミドルウェア
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.status === 404) {
        res.status(404).json({
            message: 'The requested resource was not found',
            error: err.message,
        });
    } else if (err.status === 403) {
        res.status(403).json({
            message: 'Access forbidden: you do not have permission to access this resource',
            error: err.message || 'Forbidden access',
        });
    } else {
        res.status(500).json({
            message: 'Internal Server Error',
            error: err.message || 'Unknown error occurred',
        });
    }
};

