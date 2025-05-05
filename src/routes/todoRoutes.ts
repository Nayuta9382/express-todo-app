import { Router } from "express";
import { showTodoList } from "../controllers/todoController";


// ルーティングのインスタンスを作成
const router = Router();

// ルーティングの設定

// todoトップの表示
router.get('/',showTodoList);

export default router;