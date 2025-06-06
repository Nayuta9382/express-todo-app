import { Request, Response, NextFunction } from 'express';
import { selectTaskById } from '../models/taskModel';
import passport from 'passport';
import { User } from '../types/user';
import rateLimit from 'express-rate-limit';

// ログインしていなければログインページにリダイレクトする
export const ensureAuthenticated =(req: Request, res: Response, next: NextFunction) => {
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
    const userId = (req.user as User).id;
    
    // パスパラメータからタスクidを取得
    const taskId = parseInt(req.params.id);
    // タスク情報を取得
    const task = await selectTaskById(taskId);
   if (!task) {
        const error = new Error('指定されたタスクが見つかりません') as any;
        error.status = 404;
        error.title = '404 - Task Not Found';
        return next(error);
    }

    if (task.user_id !== userId) {
        const error = new Error('このページにアクセスする権限がありません');
        (error as any).status = 403;
        return next(error);
    }

    next();

}


// ブルートフォース攻撃用のミドルウェア
export const loginLimiter = (
) => {
    return rateLimit({
        windowMs: 5 * 60 * 1000, // 5分
        max: 5, // 5回まで
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req: Request) => {
            return req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || 
                   req.socket.remoteAddress || 
                   req.ip || 
                   'unknown';
        },
        handler: (req: Request, res: Response) => {
            req.flash('error', 'ログイン試行が多すぎます。しばらくしてから再試行してください。');
            res.status(429).redirect('/auth/login');
        }
    });
};

// GitHub認証用のミドルウェア関数(コールバック関数で利用)
export const githubAuthMiddleware = () => {
    return passport.authenticate('github', {
        failureRedirect: '/auth/failure',
        session: true // セッションを使うことを明示
    });
};

// エラーハンドリングミドルウェア
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    
    // CSRFトークンエラー専用処理
    if (err.code === 'EBADCSRFTOKEN') {
        console.log("CSRF token error");
        return res.status(403).render('error/403', {
            title: '403 - 不正なリクエスト',
            error: 'フォームの有効期限が切れているか、不正な操作が検出されました。もう一度お試しください。',
        });
    }

    if (err.status === 404) {
        console.log("error404");
        res.status(404).render('error/404', {
            title: err.title || '404 - Page Not Found',
            error: err.message || 'お探しのページは存在しないか、移動された可能性があります。',
        });
    } else if (err.status === 403) {
        console.log("error403");
        res.status(403).render('error/403', {
            title: err.title || '403 - Forbidden',
            error: err.message || 'このページにアクセスする権限がありません。',
        });
    } else if (err.status === 400) {
        console.log("error400");
        res.status(400).render('error/400', {
            title: err.title || '400 Bad Request',
            error: err.message || '不正な値が入力されました',
        });
    } else {
        console.log("error500");
        console.log(`error:500:${err}`);
        res.status(500).render('error/500', {
            title: err.title || '500 - Internal Server Error',
            error: err.message || 'サーバーで予期しないエラーが発生しました。時間をおいて再度お試しください。',
        });
    }
};


