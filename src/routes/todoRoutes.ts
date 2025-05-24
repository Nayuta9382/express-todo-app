import { Router } from "express";
import { add, del, edit, insert, restore, showDetail, showTodoList, update } from "../controllers/todoController";
import { validateTask } from "../validators/taskValidator";
import { authorizeTaskOwner } from "../middlewares/middlewares";
import csrf from "csurf";


// ルーティングのインスタンスを作成
const router = Router();
const csrfProtection = csrf();
// ルーティングの設定

// todoトップの表示
router.get('/',csrfProtection,showTodoList);
// 新規追加ページ表示
router.get('/new',csrfProtection,add);
// 新規登録処理
router.post('/new',csrfProtection,validateTask,insert);
// 詳細ページ表示
router.get('/detail/:id',csrfProtection,authorizeTaskOwner ,showDetail);
// 更新ページ表示
router.get('/edit/:id',csrfProtection,authorizeTaskOwner ,edit);
// 更新処理
router.post('/edit/:id',csrfProtection,authorizeTaskOwner,validateTask, update);
// 削除処理(一つ)
// router.get('/delete/:id',authorizeTaskOwner, del);
// 削除複数
router.post('/delete',csrfProtection, del);
// 削除取り消し
router.post('/restore',csrfProtection, restore);



export default router;