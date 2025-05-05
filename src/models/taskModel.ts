import db from '../db'; // DB接続をインポート
import { RowDataPacket } from 'mysql2';

// タスクの全件取得
export const getAllTasks = async (): Promise<RowDataPacket[]> => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM tasks');
    return rows as RowDataPacket[];
  } catch (err) {
    throw new Error('Error fetching tasks: ' + err);
  }
};
