import db from '../db'; // DB接続をインポート
import { RowDataPacket } from 'mysql2';

// タスクの全件取得
export const getTaskAll = async (id:string): Promise<RowDataPacket[]> => {
  try {
		const [rows] = await db.promise().query('SELECT * FROM tasks WHERE user_id = ?',[id]);
		return rows as RowDataPacket[];
	} catch (err) {
		throw new Error('Error fetching tasks: ' + err);
	}
};
