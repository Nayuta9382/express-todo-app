import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { insertUser, userSelectById } from '../models/userModel';

// ログインページを表示
export const showLogin = (req: Request, res: Response) => {
        // もし flash メッセージがあればそれを渡す
        const errorMessage = req.flash('error');
        res.render('login', { error: errorMessage.length > 0 ? errorMessage[0] : null });
	}
// ログイン処理を行う
export const login = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate('local', {
		successRedirect: '/task',         // ログイン成功時にリダイレクト
		failureRedirect: '/auth/login',   // ログイン失敗時にリダイレクト
		failureFlash: true,               // 失敗時にflashメッセージを表示
	})(req, res, next);  // Passport の認証処理を実行
};

// 新規登録ページの表示
export const add = (req: Request, res: Response) => {
	// もし flash メッセージがあればそれを渡す
	const idErrorMessage = req.flash('idError');
	const passwordErrorMessage = req.flash('passwordError');
	res.render('signup', { 
		idError: idErrorMessage.length > 0 ? idErrorMessage[0] : null,
		passwordError: passwordErrorMessage.length > 0 ? passwordErrorMessage[0] : null
	});
}
// データベースにユーザ情報を登録
export const insert =  async (req: Request, res: Response, next: NextFunction) =>{
	try {
		const { id, name, password,confirmPassword } = req.body; // POSTデータを取得

		// IDの重複を確認
		const [existingUser] =await userSelectById(id);
		// 重複IDが存在する場合
		if (existingUser) {
			req.flash('idError', 'このIDはすでに登録されています。');
			return res.redirect('/auth/signup');
		}

		// パスワードが一致しない場合
		if(password !== confirmPassword){
			req.flash('passwordError', '確認パスワードが一致しません');
			return res.redirect('/auth/signup');
		}

		// パスワードをハッシュ化
		const hashedPassword = await bcrypt.hash(password, 10);

		// データベース登録
		await insertUser(id, name, hashedPassword); 
		res.redirect('/auth/login'); // 登録後、ログインページにリダイレクト

	} catch (err:any) {
	console.error('ユーザー登録エラー:', err);
	next(err);  // 500エラーとしてエラーハンドリングミドルウェアに渡す
	}
}