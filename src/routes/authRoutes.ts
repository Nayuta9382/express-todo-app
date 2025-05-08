import { Router } from "express";
import { add, edit, insert, login, logout, showLogin, update } from "../controllers/authController";
import { ensureAuthenticated } from "../middlewares/middlewares";
const router = Router();

// ログイン処理
router.get('/login',showLogin);
router.post('/login',login);

// ログアウト処理
router.get('/logout',logout);

// 新規登録処理
router.get('/signup', add);
router.post('/signup', insert);

// アカウント情報変更
router.get('/edit', ensureAuthenticated,edit);
router.post('/edit',ensureAuthenticated, update);

export default router;