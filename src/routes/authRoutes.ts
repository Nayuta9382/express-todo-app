import { Router } from "express";
import { add, insert, login, logout, showLogin } from "../controllers/authController";
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

export default router;