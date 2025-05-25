import db from '../db'; // DB接続をインポート
import { User } from '../types/user';

// ユーザidの検索
export const userSelectById = async (id: string): Promise<User | null> => {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0] as any;
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error;
    }
};


// ユーザ情報の新規登録
export const insertUser = async (id: string, name: string, password: string, imgPath?: string) => {
    try {
        if (imgPath) {
            await db.query('INSERT INTO users(id, name, password, img_path) VALUES($1, $2, $3, $4)', [id, name, password, imgPath]);
        } else {
            await db.query('INSERT INTO users(id, name, password) VALUES($1, $2, $3)', [id, name, password]);
        }
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error;
    }
};

// ユーザ情報更新
export const updateUser = async (id: string, name: string, imgPath: string | null) => {
    try {
        await db.query('UPDATE users SET name = $1, img_path = COALESCE($2, img_path) WHERE id = $3', [name, imgPath, id]);
    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error;
    }
};
