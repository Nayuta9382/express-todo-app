import db from '../db'; // DB接続をインポート
import { FieldPacket, RowDataPacket } from 'mysql2';

// ユーザidの曖昧検索
export const userSelectById = async (id:string):  Promise<RowDataPacket | null>  => {
	try {
        const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await db.promise().query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;  // ユーザーが見つからない場合はnullを返す
        }	
        return rows[0] as RowDataPacket;
    } catch (err) {
		throw new Error('Error fetching user: ' + err);
	}
};

// ユーザ情報の新規登録
export const insertUser = async (id:number,name:string,password:string) => {
	try {
		await db.promise().query('INSERT INTO users(id, name, password) VALUES(?, ?, ?)', [id, name, password]);
	} catch (err) {
		throw new Error('Error fetching user: ' + err);
	}
};