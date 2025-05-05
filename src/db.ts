import mysql, { Connection, QueryError } from 'mysql2';

const db: Connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
// 接続関数を明示的に呼び出す用に定義
export const connectDB = () => {
  db.connect((err: QueryError | null) => {
    if (err) {
      console.error('MySQLへの接続に失敗しました: ', err);
      return;
    }
    console.log('MySQLに接続しました');
  });
};

export default db;
