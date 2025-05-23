import { NextFunction, Request, Response } from "express";
import { addTask, deleteTask, getTaskAll, restoreTask, selectTaskById, selectTasksByIds, updateTask } from '../models/taskModel';
import { serialize } from "v8";
import { ValidationError, validationResult } from "express-validator";
import { handleValidationErrors } from "../utils/handleValidationErrors";
import { renderWithSessionClear } from "../utils/renderWithSessionClear";
import { User } from "../types/user";

// タスク一覧ページを表示
export const showTodoList = async (req:Request, res:Response, next:NextFunction) =>{
    const userId = (req.user as User).id; 
    
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

    // 1週間前と今日の日付を取得
    const todayDate = new Date();
    const todayStr = `${todayDate.getFullYear()}-${todayDate.getMonth() + 1}-${todayDate.getDate()}`;
    const today = new Date(todayStr);
    const oneWeekLaterDate = new Date();
    oneWeekLaterDate.setDate(todayDate.getDate() + 7);
    const oneWeekLaterStr = `${oneWeekLaterDate.getFullYear()}-${oneWeekLaterDate.getMonth() + 1}-${oneWeekLaterDate.getDate()}`;
    const oneWeekLater = new Date(oneWeekLaterStr);
    
    try {
        const tasks = await getTaskAll(userId,searchText,sort,delFlg);
        res.render('task-all', { tasks, searchText, sort, delFlg, today, oneWeekLater , csrfToken: req.csrfToken()}); 
	} catch (e) {
        const error = new Error() as any;
        error.status = 500;
        return next(error);
	}
}
// 新規追加ページを表示
export const add =  (req:Request, res:Response ) =>{
    renderWithSessionClear(req,res,'task-new',{ csrfToken: req.csrfToken()});
}
// 新規登録処理
export const insert = async (req:Request, res:Response ,next:NextFunction) =>{
    
    // バリデーションエラーがあるのなら
    if (handleValidationErrors(req, res, '/task/new')) return;    
    
    // POSTデータを取得
    const { title, detail, deadline } = req.body; 
    // userIdを取得
    const userId = (req.user as User).id; 
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
    try{
        const id = parseInt(req.params.id);
        const task = await selectTaskById(id);
        // タスクが存在しない場合
        if (!task) {
            const error = new Error('指定されたタスクが見つかりません') as any;
            error.status = 404;
            error.title = '404 - Task Not Found';
            return next(error);
        }
        // 1週間前と今日の日付を取得
        const todayDate = new Date();
        const todayStr = `${todayDate.getFullYear()}-${todayDate.getMonth() + 1}-${todayDate.getDate()}`;
        const today = new Date(todayStr);
        const oneWeekLaterDate = new Date();
        oneWeekLaterDate.setDate(todayDate.getDate() + 7);
        const oneWeekLaterStr = `${oneWeekLaterDate.getFullYear()}-${oneWeekLaterDate.getMonth() + 1}-${oneWeekLaterDate.getDate()}`;
        const oneWeekLater = new Date(oneWeekLaterStr);

        // 詳細を改行コードを習得してエスケープ処理
        const escaped = String(task.detail)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    
        // 改行コードを<br>に変換
        task.detail = escaped.replace(/\r?\n/g, '<br>');
        
        res.render('task-detail',{task, today, oneWeekLater}); 
    } catch (err) {
            console.error(err);
            const error = new Error() as any;
            error.status = 500;
            return next(error);
    }
}

// 更新ページ表示
export const edit = async (req:Request, res:Response, next:NextFunction) =>{
    try{
        const id = parseInt(req.params.id);
        const task = await selectTaskById(id);
        // タスクが存在しない場合
        if (!task) {
            const error = new Error('指定されたタスクが見つかりません') as any;
            error.status = 404;
            error.title = '404 - Task Not Found';
            return next(error);
        }
        renderWithSessionClear(req,res,`task-edit`,{task, csrfToken: req.csrfToken()});
    } catch (err) {
            console.error(err);
            const error = new Error() as any;
            error.status = 500;
            return next(error);
    }
}

// 更新処理
export const update = async (req:Request, res:Response, next:NextFunction) =>{
    try{
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
    } catch (err) {
            console.error(err);
            const error = new Error() as any;
            error.status = 500;
            return next(error);
    }

}


// 削除処理(複数)
export const del = async (req:Request, res:Response,next:NextFunction) =>{
    try{
        // 削除するidの一覧を取得
        const ids:Array<string>  = req.body.ids;
        const userId = (req.user as User).id;

        // 送信件数が0件の場合
        if (!req.body.ids || typeof req.body.ids !== 'object' || !Array.isArray(req.body.ids) || req.body.ids.length === 0) {
            return res.redirect(`/task`);
        }

        // 一括の取得
        const numberIds: number[] = [];

        for (const id of ids) {
            const num = parseInt(id, 10);
            if (isNaN(num)) {
                const error = new Error('不正な値が入力されました') as any;
                error.status = 400;
                return next(error);
            }
            numberIds.push(num);
        }
        const tasks = await selectTasksByIds(numberIds);

        if (!tasks || tasks.length !== numberIds.length) {
            const error = new Error('指定されたタスクが見つかりません') as any;
            error.status = 404;
            return next(error);
        }

        for (const task of tasks) {
            if (task.user_id !== userId) {
                const error = new Error('このタスクを更新する権限がありません。') as any;
                error.status = 403;
                return next(error);
            }
        }

        // タスクを削除
        await deleteTask(numberIds);

        // タスク一覧ページにリダイレクト
        res.redirect(`/task`);
    } catch (err) {
            console.error(err);
            const error = new Error() as any;
            error.status = 500;
            return next(error);
    }


}

// 削除取り消し
export const restore = async (req:Request, res:Response,next:NextFunction) =>{
    try {
        // 削除するidの一覧を取得
        const ids:Array<string>  = req.body.ids;
        const userId = (req.user as User).id;

        // 送信件数が0件の場合
        if (!req.body.ids || typeof req.body.ids !== 'object' || !Array.isArray(req.body.ids) || req.body.ids.length === 0) {
            return res.redirect(`/task`);
        }

        // 一括の取得
        const numberIds: number[] = [];

        for (const id of ids) {
            const num = parseInt(id, 10);
            if (isNaN(num)) {
                const error = new Error('不正な値が入力されました') as any;
                error.status = 400;
                return next(error);
            }
            numberIds.push(num);
        }
        const tasks = await selectTasksByIds(numberIds);

        if (!tasks || tasks.length !== numberIds.length) {
            const error = new Error('指定されたタスクが見つかりません') as any;
            error.status = 404;
            return next(error);
        }

        for (const task of tasks) {
            if (task.user_id !== userId) {
                const error = new Error('このタスクを更新する権限がありません。') as any;
                error.status = 403;
                return next(error);
            }
        }

        // タスクの復元
        await restoreTask(numberIds);
        // タスク一覧ページにリダイレクト
        res.redirect(`/task`);
    } catch (err) {
            console.error(err);
            const error = new Error() as any;
            error.status = 500;
            return next(error);
    }


}
