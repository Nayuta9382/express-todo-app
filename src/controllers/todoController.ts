import { Request, Response } from "express";
import { getAllTasks } from '../models/taskModel';

// ルーティングから呼び出されるコントローラ
export const showTodoList = async (req:Request, res:Response) =>{
    try {
        const tasks = await getAllTasks();
        res.render('task-all', { tasks }); // EJSに渡す
      } catch (error) {
        res.status(500).send('タスクの取得中にエラーが発生しました');
      }
}