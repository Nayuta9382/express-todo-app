import db from '../db'; // DB接続をインポート
import { FieldPacket, RowDataPacket } from 'mysql2';

// タスクの全件取得(削除されていない)
export const getTaskAll = async (id:string,searchText:string,sort:string): Promise<RowDataPacket[]> => {
  try {
        const orderBy = sort === 'asc' ? 'ORDER BY deadline ASC' : 'ORDER BY deadline DESC'
		const [rows] = await db.promise().query(`SELECT id,user_id,title,detail, DATE_FORMAT(deadline, "%Y-%m-%d") AS deadline FROM tasks WHERE user_id = ? AND del_flg = 0 AND title LIKE ? ${orderBy}`,[id,`%${searchText}%`]);
		return rows as RowDataPacket[];
	} catch (err) {
		throw new Error('Error fetching tasks: ' + err);
	}
};

// id検索によるタスク情報取得
export const selectTaskById = async (id:number): Promise<RowDataPacket | null> => {
    const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await db.promise().query('SELECT id,user_id,title,detail, DATE_FORMAT(deadline, "%Y-%m-%d") AS deadline FROM tasks WHERE id = ?', [id]);
    if (rows.length === 0) {
        return null;  // 検索結果が見つからない場合はnullを返す
    }	
    return rows[0] as RowDataPacket;
}


// タスクの新規登録
export const addTask = async (userId:string, title:string, detail:string, deadline:Date) => {
    try {
        await db.promise().query('INSERT INTO tasks(user_id,title,detail,deadline) VALUES(?,?,?,?)',[userId,title,detail,deadline]);

    } catch (err) {
        throw new Error('task insert error: ' + err);
    }
}

// タスクの更新処理
export const updateTask = async (id:number, title:string, detail:string, deadline:Date) => {
    try {
        await db.promise().query('UPDATE tasks SET title = ? , detail = ? , deadline = ? WHERE id = ?',[title,detail,deadline,id]);

    } catch (err) {
        throw new Error('task insert error: ' + err);
    }
}

// タスクの削除処理
export const deleteTask = async (id:number) => {
    try {
        await db.promise().query('UPDATE tasks SET del_flg = 1 WHERE id = ?',[id]);

    } catch (err) {
        throw new Error('task insert error: ' + err);
    }
}


