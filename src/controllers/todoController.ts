import { Request, Response } from "express";
import { addTask, getTaskAll } from '../models/taskModel';

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
    res.render('new-task'); 
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
