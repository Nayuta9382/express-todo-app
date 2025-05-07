import db from '../db'; // DB接続をインポート
import { FieldPacket, RowDataPacket } from 'mysql2';

// タスクの全件取得
export const getTaskAll = async (id:string): Promise<RowDataPacket[]> => {
  try {
		const [rows] = await db.promise().query('SELECT * FROM tasks WHERE user_id = ?',[id]);
		return rows as RowDataPacket[];
	} catch (err) {
		throw new Error('Error fetching tasks: ' + err);
	}
};

// id検索によるタスク情報取得
export const selectTaskById = async (id:string): Promise<RowDataPacket | null> => {
    const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await db.promise().query('SELECT * FROM tasks WHERE id = ?', [id]);
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
