import { Router } from "express";
import { add, edit, insert, login, logout, showLogin, showLoginWithError, update } from "../controllers/authController";
import { ensureAuthenticated } from "../middlewares/middlewares";
import { validateSignup } from "../validators/signupValidator";
import { validateUpdateUser } from "../validators/updateUserValidator";
import { upload } from "../utils/upload";
const router = Router();

// ログイン処理
router.get('/login',showLogin);
// ログイン失敗時にエラーを保持してログインページを表示
router.get('/login-error',showLoginWithError);
router.post('/login',login);


// ログアウト処理
router.get('/logout',logout);

// 新規登録処理
router.get('/signup', add);
router.post('/signup',validateSignup, insert);

// アカウント情報変更
router.get('/edit', ensureAuthenticated,edit);
router.post('/edit', update);

export default router;