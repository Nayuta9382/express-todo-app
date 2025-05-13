import { Router } from "express";
import { add, del, edit, insert, showDetail, showTodoList, update } from "../controllers/todoController";
import { validateTask } from "../validators/taskValidator";
import { authorizeTaskOwner } from "../middlewares/middlewares";


// ルーティングのインスタンスを作成
const router = Router();

// ルーティングの設定

// todoトップの表示
router.get('/',showTodoList);
// 新規追加ページ表示
router.get('/new',add);
// 新規登録処理
router.post('/new',authorizeTaskOwner,validateTask,insert);
// 詳細ページ表示
router.get('/detail/:id',authorizeTaskOwner ,showDetail);
// 更新ページ表示
router.get('/edit/:id',authorizeTaskOwner ,edit);
// 更新ページ削除
router.post('/edit/:id',authorizeTaskOwner,validateTask, update);
// 削除処理
router.get('/delete/:id',authorizeTaskOwner, del);


export default router;