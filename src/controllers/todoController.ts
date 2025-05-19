import { NextFunction, Request, Response } from "express";
import { addTask, deleteTask, getTaskAll, selectTaskById, updateTask } from '../models/taskModel';
import { serialize } from "v8";
import { ValidationError, validationResult } from "express-validator";
import { handleValidationErrors } from "../utils/handleValidationErrors";
import { renderWithSessionClear } from "../utils/renderWithSessionClear";

// タスク一覧ページを表示
export const showTodoList = async (req:Request, res:Response, next:NextFunction) =>{
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
    let delFlg = 0;
    if (req.query && req.query['task-status'] !== undefined && typeof req.query['task-status'] === 'string' && req.query['task-status'] === '1') {
        delFlg = 1;
    }
    
    try {
        const tasks = await getTaskAll(userId,searchText,sort,delFlg);
        res.render('task-all', { tasks, searchText, sort, delFlg }); 
	} catch (e) {
        const error = new Error() as any;
        error.status = 500;
        return next(error);
	}
}
// 新規追加ページを表示
export const add =  (req:Request, res:Response ) =>{
    renderWithSessionClear(req,res,'task-new');
}
// 新規登録処理
export const insert = async (req:Request, res:Response ,next:NextFunction) =>{
    
    // バリデーションエラーがあるのなら
    if (handleValidationErrors(req, res, '/task/new')) return;    
    
    // POSTデータを取得
    const { title, detail, deadline } = req.body; 
    // userIdを取得
    const userId = (req.user as any).id; 
    // データーべースにデータを追加
    try{
        await addTask(userId,title,detail,deadline);
        res.redirect('/task');
	} catch (err:any) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        return next(error);
	}
}

// 詳細ページを表示
export const showDetail = async (req:Request, res:Response, next:NextFunction) =>{
    const id = parseInt(req.params.id);
    const task = await selectTaskById(id);
    // タスクが存在しない場合
    if (!task) {
        const error = new Error('指定されたタスクが見つかりません') as any;
        error.status = 404;
        error.title = '404 - Task Not Found';
        return next(error);
    }
    res.render('task-detail',{task}); 
}

// 更新ページ表示
export const edit = async (req:Request, res:Response, next:NextFunction) =>{
    const id = parseInt(req.params.id);
    const task = await selectTaskById(id);
    // タスクが存在しない場合
    if (!task) {
        const error = new Error('指定されたタスクが見つかりません') as any;
        error.status = 404;
        error.title = '404 - Task Not Found';
        return next(error);
    }
    renderWithSessionClear(req,res,`task-edit`,{task});
}

// 更新処理
export const update = async (req:Request, res:Response, next:NextFunction) =>{
    const id = parseInt(req.params.id);
    // バリデーションエラーがあるのなら
    if (handleValidationErrors(req, res, `/task/edit/${id}`)) return;    

    const { title, detail, deadline } = req.body; 
    const task = await selectTaskById(id);
    // タスクが存在しない場合
    if (!task) {
        const error = new Error('指定されたタスクが見つかりません') as any;
        error.status = 404;
        error.title = '404 - Task Not Found';
        return next(error);
    }

    // 更新処理
    await updateTask(id,title,detail,deadline);
    // 詳細ページにリダイレクト
    res.redirect(`/task/detail/${id}`);

}

// 削除処理
export const del = async (req:Request, res:Response,next:NextFunction) =>{
    const id = parseInt(req.params.id);
    const task = await selectTaskById(id);
    // タスクが存在しない場合
     if (!task) {
        const error = new Error('指定されたタスクが見つかりません') as any;
        error.status = 404;
        error.title = '404 - Task Not Found';
        return next(error);
    }
    // 削除処理
    await deleteTask(id);
    // タスク一覧ページにリダイレクト
    res.redirect(`/task`);


}
