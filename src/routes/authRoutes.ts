import { Router } from "express";
import { add, insert, login, showLogin } from "../controllers/authController";
const router = Router();

// ログイン処理
router.get('/login',showLogin);
router.post('/login',login);

// 新規登録処理
router.get('/signup',add);
router.post('/signup',insert);
 
export default router;