import { Router } from "express";
import { add, insert, showTodoList } from "../controllers/todoController";


// ルーティングのインスタンスを作成
const router = Router();

// ルーティングの設定

// todoトップの表示
router.get('/',showTodoList);
router.get('/new',add);
router.post('/new',insert);


export default router;