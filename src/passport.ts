import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { userSelectById } from './models/userModel';
import bcrypt from 'bcrypt';




// ローカル戦略の設定
passport.use(new LocalStrategy(
    {
        usernameField: 'id',            // ← ここが重要
        passwordField: 'password',      // 通常はこのままでOK
      },
    async (id:string, password:string, done) => {
    try {
    
        // データベースからユーザー情報を取得
        const [rows] = await userSelectById(id);
        const user = rows ? rows : null;
        
        // ユーザーが存在しない
        if (!user) {
            return done(null, false, { message: 'idとパスワードが一致しません' });
        }
        
        // パスワードが一致するかどうか
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'idとパスワードが一致しません' });
        }
    
        return done(null, user); // 認証成功
        } catch (err) {
        return done(err);
        }
  }));

// ユーザー情報をセッションに保存する処理
passport.serializeUser((user: any, done) => {
  done(null, user.id);  // IDだけ保存（セッションに保存）
});

// セッションIDからユーザー情報を復元する処理
passport.deserializeUser(async (id: string, done) => {
    try {
      // データベースからユーザー情報を取得
      const [rows] = await userSelectById(id);
      const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  
      if (!user) {
        return done(null, false);  // オプションなしで false を渡す
      }
  
      done(null, user);  // ユーザー情報を復元
    } catch (err) {
      done(err);  // エラー処理
    }
  });

export default passport;
