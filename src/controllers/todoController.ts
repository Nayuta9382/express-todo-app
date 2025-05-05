import { Request, Response } from "express";
import { getTaskAll } from '../models/taskModel';

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