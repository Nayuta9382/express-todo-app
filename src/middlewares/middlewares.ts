import { Request, Response, NextFunction } from 'express';

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

// エラーハンドリングミドルウェア
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.status === 404) {
        res.status(404).json({
            message: 'The requested resource was not found',
            error: err.message,
        });
    } else {
        res.status(500).json({
            message: 'Internal Server Error',
            error: err.message || 'Unknown error occurred',
        });
    }
};
