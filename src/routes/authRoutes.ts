import { Router } from "express";
import { add, edit, gitHubCallback, insert, login, logout,  showLogin, showLoginWithError, update } from "../controllers/authController";
import { ensureAuthenticated, githubAuthMiddleware, loginLimiter } from "../middlewares/middlewares";
import { validateSignup } from "../validators/signupValidator";
import passport from "passport";
import csrf from "csurf";
const router = Router();
const csrfProtection = csrf();

// ログイン処理
router.get('/login',csrfProtection,showLogin);
// ログイン失敗時にエラーを保持してログインページを表示
router.get('/login-error',csrfProtection,showLoginWithError);
router.post('/login',csrfProtection,loginLimiter(),login);


// ログアウト処理
router.get('/logout',logout);

// 新規登録処理
router.get('/signup', csrfProtection,add);
router.post('/signup',csrfProtection,validateSignup, insert);

// アカウント情報変更
router.get('/edit',csrfProtection, ensureAuthenticated,edit);
// バリデーション・csrfはコントローラー内で検証
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

