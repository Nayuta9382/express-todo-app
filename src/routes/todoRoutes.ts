import { Router } from "express";
import { add, insert, showDetail, showTodoList } from "../controllers/todoController";


// ルーティングのインスタンスを作成
const router = Router();

// ルーティングの設定

// todoトップの表示
router.get('/',showTodoList);
// 新規追加ページ表示
router.get('/new',add);
// 新規登録処理
router.post('/new',insert);
// 詳細ページ表示
router.get('/detail/:id', showDetail);

export default router;