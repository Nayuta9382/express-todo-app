import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { insertUser, updateUser, userSelectById } from '../models/userModel';
import { RowDataPacket } from 'mysql2';
import { deleteFileIfExists, upload } from '../utils/upload';
import { renderWithSessionClear } from '../utils/renderWithSessionClear';
import { handleValidationErrors } from '../utils/handleValidationErrors';
import { validateUpdateUser } from '../validators/updateUserValidator';
import { ValidationError, validationResult } from 'express-validator';
import { User } from '../types/user';

// ログインページを表示
export const showLogin = (req: Request, res: Response,next: NextFunction) => {
    // もし flash メッセージがあればそれを渡す
    res.render('login', { noShowHeader : true,error:  null });
  
}

// ログイン処理でエラーがある場合エラーを保持してログインページを表氏
export const showLoginWithError = (req: Request, res: Response,next: NextFunction) => {
    const errorMessage = req.flash('error');
    if(errorMessage.length > 0){
        res.render('login', { error: errorMessage[0] });
    }else{
        res.redirect('/auth/login');
    }
    // もし flash メッセージがあればそれを渡す
}
// ログイン処理を行う
export const login = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate('local', {
		successRedirect: '/task',         // ログイン成功時にリダイレクト
		failureRedirect: '/auth/login-error',   // ログイン失敗時にリダイレクト
		failureFlash: 'idとパスワードが一致しません',               // 失敗時にflashメッセージを表示
	})(req, res, next);  // Passport の認証処理を実行
};
// ログアウト処理
export const logout = (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
          if (err) {
            console.error(err);            
            const error = new Error() as any;
            error.status = 500;
            return next(error);
        }

        // セッションの完全な破棄
        if (req.session) {

            req.session.destroy((err) => {
                if (err) {
                    console.error(err);
                    const error = new Error() as any;
                    error.status = 500;
                    return next(error);
                }
                
                // セッションIDを保持するクッキーも削除
                res.clearCookie('connect.sid'); 
                
                // セッション破棄が完了したら、ログインページにリダイレクト
                res.redirect('/auth/login');
            });
        }else{
            res.clearCookie('connect.sid');
            res.redirect('/auth/login');
        }
    });
};


// 新規登録ページの表示
export const add = (req: Request, res: Response) => {
	// もし flash メッセージがあればそれを渡す
	const idErrorMessage = req.flash('idError');
	const passwordErrorMessage = req.flash('passwordError');
    
    renderWithSessionClear(req,res,'signup',{ 
        noShowHeader : true,
		idError: idErrorMessage.length > 0 ? idErrorMessage[0] : null,
		passwordError: passwordErrorMessage.length > 0 ? passwordErrorMessage[0] : null
	});

}
// データベースにユーザ情報を登録
export const insert =  async (req: Request, res: Response, next: NextFunction) =>{
	try {
        if (handleValidationErrors(req, res, '/auth/signup')) return;    
    

		const { id, name, password,confirmPassword } = req.body; // POSTデータを取得

		// IDの重複を確認
		const existingUser :RowDataPacket | null = await userSelectById(id);
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
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        return next(error);
	}
}

// ユーザー情報変更ページ表示
export const edit =  async (req: Request, res: Response, next: NextFunction) =>{
    const uploadError = req.flash('uploadError');
    
    // setUserToLocalsでuser情報を渡されるためuser情報は渡さない
     renderWithSessionClear(req,res,'user-edit',{ 
		uploadError: uploadError.length > 0 ? uploadError[0] : null,
	});

}

// ユーザー情報変更処理
export const update = (req: Request, res: Response, next: NextFunction) => {
    // ファイルのアップロード処理
    upload.single('profile-img')(req, res, async (err: any) => {
        // バリデーションの実行
        try{
            await Promise.all(validateUpdateUser.map(validation => validation.run(req)));
        } catch (err:any) {
            console.error(err);
            const error = new Error() as any;
            error.status = 500;
            return next(error);
        }
        // バリデーションエラーがあればリダイレクトする
        if (handleValidationErrors(req, res, '/auth/edit',true)) return;  // バリデーションエラーがあればリダイレクト
        // エラーハンドリング(ファイルが送信されていない場合はアップロード処理自体は行わない)
        
        if (err) {
            // サイズ超過エラー
            // ファイルタイプが不正な場合
            if (err.code === 'LIMIT_FILE_SIZE') {
                req.flash('uploadError', 'ファイルサイズが大きすぎます。最大サイズは2MBです。');
            } 
            else if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message === '対応していないファイル形式です') {
                req.flash('uploadError', '無効なファイルタイプです。JPEG, PNG, GIF のいずれかの画像ファイルをアップロードしてください。');
            }
            // その他のエラー
            else {
                req.flash('uploadError', 'ファイルのアップロード中にエラーが発生しました。再度お試しください。');
            }
            return res.redirect('/auth/edit');
      
        }
        
        // 無効なファイルなら
        if (!req.file && req.session.fileTypeError) {
            delete req.session.fileTypeError;
            req.flash('uploadError', '無効なファイルタイプです。JPEG, PNG, GIF のいずれかの画像をアップロードしてください。');
            return res.redirect('/auth/edit');
        }
        
        
        // セッションの削除
        delete req.session.fileTypeError;
        delete req.session.oldInput;

        // ファイルが送信されている場合保存されているファイル名を取得
        try {
            const userId = (req.user as User).id;
            const user = await userSelectById(userId);
            let filePath = user && user.img_path;

            if (req.file) {
                // 既に保存されているデフォルト画像以外の画像を削除
                if (user?.img_path && user.img_path.startsWith('/uploads/') && user.img_path !== '/uploads/default-img.png') {
                    console.log("削除");
                    
                    deleteFileIfExists(user.img_path);
                }
                
                filePath = `/uploads/${req.file.filename}`;
            }

            // データベースへの保存処理
            const { name } = req.body; // POSTデータを取得

            await updateUser(userId, name, filePath);
            return res.redirect('/task');
        } catch (err) {
            console.error(err);
            const error = new Error() as any;
            error.status = 500;
            return next(error);
        }
    });
};

// github認証のコールバック関数
export const gitHubCallback = 
  (req: Request, res: Response,next:NextFunction) => {
    // リダイレクト前にセッションの保存を確実に行う
    req.session.save((err) => {
      if (err) {
            console.error(err);
            const error = new Error() as any;
            error.status = 500;
            return next(error);      }
      // ログイン成功後、ダッシュボードなどにリダイレクト
      res.redirect('/task');
    });
  }
