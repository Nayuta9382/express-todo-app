import { NextFunction, Request, Response, Router } from "express";
import { add, edit, gitHubCallback, insert, login, logout,  showLogin, showLoginWithError, update } from "../controllers/authController";
import { ensureAuthenticated, githubAuthMiddleware, loginLimiter } from "../middlewares/middlewares";
import { validateSignup } from "../validators/signupValidator";
import { validateUpdateUser } from "../validators/updateUserValidator";
import { upload } from "../utils/upload";
import passport from "passport";
import { userSelectById } from "../models/userModel";
const router = Router();

// ログイン処理
router.get('/login',showLogin);
// ログイン失敗時にエラーを保持してログインページを表示
router.get('/login-error',showLoginWithError);
router.post('/login',loginLimiter(),login);


// ログアウト処理
router.get('/logout',logout);

// 新規登録処理
router.get('/signup', add);
router.post('/signup',validateSignup, insert);

// アカウント情報変更
router.get('/edit', ensureAuthenticated,edit);
router.post('/edit',ensureAuthenticated, update);


// github認証処理
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// github認証のコールバック関数
router.get('/github/callback', githubAuthMiddleware(),gitHubCallback );

// github認証失敗ようのページの表示
router.get('/failure', (req, res) => {
    res.render('error/auth-failure'); // EJSなどのテンプレートエンジンを使用している場合
});


// ルーターをエクスポート
export default router;

