import { Request, Response } from "express";
import { addTask, getTaskAll, selectTaskById, updateTask } from '../models/taskModel';

// ルーティングから呼び出されるコントローラ
export const showTodoList = async (req:Request, res:Response) =>{
    try {
        const userId = (req.user as any).id; 
        const tasks = await getTaskAll(userId);
        res.render('task-all', { tasks }); 
	} catch (error) {
        console.error(error);
		res.status(500).send('タスクの取得中にエラーが発生しました');
	}
}
// 新規追加ページを表示
export const add =  (req:Request, res:Response) =>{
    res.render('task-new'); 
}
// 新規登録処理
export const insert = async (req:Request, res:Response) =>{
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
    updateTask(id,title,detail,deadline);
    // 詳細ページにリダイレクト
    res.redirect(`/task/detail/${id}`);

}
