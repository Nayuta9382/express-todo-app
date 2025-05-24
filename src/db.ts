import mysql, { Pool } from 'mysql2';
import dotenv from 'dotenv';  // dotenvをインポート
import { PoolConnection } from 'mysql2/typings/mysql/lib/PoolConnection';

// .envを読み込む
dotenv.config();


const db: Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    queueLimit: 0,
    connectionLimit: 4, 
    waitForConnections: true
});
// 接続関数を明示的に呼び出す用に定義
export const connectDB = () => {
 db.getConnection((err: any | null, connection: PoolConnection) => {
        if (err) {
        console.error('MySQLへの接続に失敗しました: ', err);
        return;
        }
        console.log('MySQLに接続しました');
    });
};

export default db;
