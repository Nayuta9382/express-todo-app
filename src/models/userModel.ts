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
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 	}
};

// ユーザ情報の新規登録
export const insertUser = async (id:string,name:string,password:string) => {
	try {
		await db.promise().query('INSERT INTO users(id, name, password) VALUES(?, ?, ?)', [id, name, password]);
	} catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 	
    }
};

// ユーザ情報更新
export const updateUser = async (id:string,name:string,imgPath:string) => {
	try {
        await db.promise().query('UPDATE users SET name = ?, img_path = COALESCE(?, img_path) WHERE id = ?',[name, imgPath, id]);
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 	
	}
};