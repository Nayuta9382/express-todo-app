import { Request, Response } from "express";
import { addTask, deleteTask, getTaskAll, selectTaskById, updateTask } from '../models/taskModel';
import { serialize } from "v8";
import { ValidationError, validationResult } from "express-validator";
import { handleValidationErrors } from "../utils/handleValidationErrors";
import { renderWithSessionClear } from "../utils/renderWithSessionClear";

// タスク一覧ページを表示
export const showTodoList = async (req:Request, res:Response) =>{
    try {
        const userId = (req.user as any).id; 

        // 検索したい文字列があるなら取得
        let searchText = '';
        if (req.query && req.query['search'] !== undefined && typeof req.query['search'] === 'string') {
            searchText = req.query['search'];
        }

        // 期限の昇順・降順を取得(デフォルトは昇順)
        let sort = 'asc';
        if (req.query && req.query['sort'] !== undefined && typeof req.query['sort'] === 'string' && req.query['sort'] === 'desc') {
            sort = 'desc';
        }


        const tasks = await getTaskAll(userId,searchText,sort);
        res.render('task-all', { tasks, searchText, sort }); 
	} catch (error) {
        console.error(error);
		res.status(500).send('タスクの取得中にエラーが発生しました');
	}
}
// 新規追加ページを表示
export const add =  (req:Request, res:Response) =>{
    renderWithSessionClear(req,res,'task-new');
}
// 新規登録処理
export const insert = async (req:Request, res:Response) =>{
    // バリデーションエラーがあるのなら
    if (handleValidationErrors(req, res, '/task/new')) return;    
    
    // POSTデータを取得
    const { title, detail, deadline } = req.body; 
    // userIdを取得
    const userId = (req.user as any).id; 
    // データーべースにデータを追加
    await addTask(userId,title,detail,deadline);
    res.redirect('/task');
}

// 詳細ページを表示
export const showDetail = async (req:Request, res:Response) =>{
    const id = req.params.id;
    const task = await selectTaskById(id);
    // タスクが存在しない場合
    if (!task) {
        return res.status(404).render('404', {
            message: '存在しないページです',
        });
    }
    res.render('task-detail',{task}); 

}

// 更新ページ表示
export const edit = async (req:Request, res:Response) =>{
    const id = req.params.id;
    const task = await selectTaskById(id);
    // タスクが存在しない場合
    if (!task) {
        return res.status(404).render('404', {
            message: '存在しないページです',
        });
    }

    res.render('task-edit',{task}); 
}

// 更新処理
export const update = async (req:Request, res:Response) =>{
    const { title, detail, deadline } = req.body; 
    const id = req.params.id;
    const task = await selectTaskById(id);
    // タスクが存在しない場合
    if (!task) {
        return res.status(404).render('404', {
            message: '更新対象のデータが見つかりませんでした',
        });
    }

    // 更新処理
    await updateTask(id,title,detail,deadline);
    // 詳細ページにリダイレクト
    res.redirect(`/task/detail/${id}`);

}

// 削除処理
export const del = async (req:Request, res:Response) =>{
    const id = req.params.id;
    const task = await selectTaskById(id);
    // タスクが存在しない場合
    if (!task) {
        return res.status(404).render('404', {
            message: '削除対象のデータが見つかりませんでした',
        });
    }
    // 削除処理
    await deleteTask(id);
    // タスク一覧ページにリダイレクト
    res.redirect(`/task`);


}
