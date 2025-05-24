import db from '../db'; // DB接続をインポート
import { FieldPacket, RowDataPacket } from 'mysql2';

// タスクの全件取得(削除されていない)
export const getTaskAll = async (id:string,searchText:string,sort:string,delFlg:number): Promise<RowDataPacket[]> => {
  try {
        const orderBy = sort === 'asc' ? 'ORDER BY deadline ASC' : 'ORDER BY deadline DESC'
		const [rows] = await db.promise().query(`SELECT id,user_id,title,detail, DATE_FORMAT(deadline, "%Y-%m-%d") AS deadline FROM tasks WHERE user_id = ? AND del_flg = ? AND title LIKE ? ${orderBy}`,[id,delFlg,`%${searchText}%`]);
		return rows as RowDataPacket[];
	} catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 
	}
};

// id検索によるタスク情報取得
export const selectTaskById = async (id:number): Promise<RowDataPacket | null> => {
    try {
        const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await db.promise().query('SELECT id,user_id,title,detail, DATE_FORMAT(deadline, "%Y-%m-%d") AS deadline FROM tasks WHERE id = ?', [id]);
        if (rows.length === 0) {
            return null;  // 検索結果が見つからない場合はnullを返す
        }	
        return rows[0] as RowDataPacket;
	} catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 
	}
}

// id複数検索によるタスク情報取得
export const selectTasksByIds = async (ids:number[]): Promise<RowDataPacket[] | null> => {
    try {
        const [rows, fields]: [RowDataPacket[], FieldPacket[]] = await db.promise().query(
        `SELECT * FROM tasks WHERE id IN (${ids.map(() => '?').join(',')})`, 
        [...ids]
        );
        if (rows.length === 0) {
            return null;  // 検索結果が見つからない場合はnullを返す
        }	
        return rows as RowDataPacket[];
	} catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 
	}
}




// タスクの新規登録
export const addTask = async (userId:string, title:string, detail:string, deadline:Date) => {
    try {
        await db.promise().query('INSERT INTO tasks(user_id,title,detail,deadline) VALUES(?,?,?,?)',[userId,title,detail,deadline]);

    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 
    }
}

// タスクの更新処理
export const updateTask = async (id:number, title:string, detail:string, deadline:Date) => {
    try {
        await db.promise().query('UPDATE tasks SET title = ? , detail = ? , deadline = ? WHERE id = ?',[title,detail,deadline,id]);

    } catch (err) {
       console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 
    }
}

// タスクの削除処理(複数一括)
export const deleteTask = async (ids:number[]) => {
    try {
       await db.promise().query(
        `UPDATE tasks SET del_flg = 1 WHERE id IN (${ids.map(() => '?').join(',')})`, 
        [...ids]
);

    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 
    }
}


// タスクの削除取り消し処理(複数一括)
export const restoreTask = async (ids:number[]) => {
    try {
       await db.promise().query(
        `UPDATE tasks SET del_flg = 0 WHERE id IN (${ids.map(() => '?').join(',')})`, 
        [...ids]
);

    } catch (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        throw error; 
    }
}
