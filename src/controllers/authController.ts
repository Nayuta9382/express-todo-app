import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { insertUser, updateUser, userSelectById } from '../models/userModel';
import { deleteFileIfExists, upload } from '../utils/upload';
import { renderWithSessionClear } from '../utils/renderWithSessionClear';
import { handleValidationErrors } from '../utils/handleValidationErrors';
import { validateUpdateUser } from '../validators/updateUserValidator';
import { User } from '../types/user';
import csrf from 'csurf';
import { supabase } from '../utils/supabase';
import fs from 'fs';
import path from 'path';



const csrfProtection = csrf();



// ログインページを表示
export const showLogin = (req: Request, res: Response,next: NextFunction) => {
    // もし flash メッセージがあればそれを渡す
    const errorMessage = req.flash('error');
    if(errorMessage.length > 0){
        res.render('login', {noShowHeader : true, error: errorMessage[0],  csrfToken: req.csrfToken() });
    }else{
        res.render('login', { noShowHeader : true,error:  null , csrfToken: req.csrfToken()});
    }
  
}

// ログイン処理でエラーがある場合エラーを保持してログインページを表氏
export const showLoginWithError = (req: Request, res: Response,next: NextFunction) => {
    const errorMessage = req.flash('error');
    if(errorMessage.length > 0){
        res.render('login', {noShowHeader : true, error: errorMessage[0] , csrfToken: req.csrfToken() });
    }else{
        res.redirect('/auth/login');
    }
    // もし flash メッセージがあればそれを渡す
}
// ログイン処理を行う
export const login = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err:any, user:User, info:any) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            // 認証失敗時に flash メッセージをセット
            req.flash('error', 'idとパスワードが一致しません');
            return res.redirect('/auth/login-error');
        }

        // 認証成功時にセッションIDを再生成
        req.session.regenerate((err) => {
            if (err) {
                return next(err);
            }
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.redirect('/task');
            });
        });
    })(req, res, next);
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
		passwordError: passwordErrorMessage.length > 0 ? passwordErrorMessage[0] : null,
        csrfToken: req.csrfToken()
	});

}
// データベースにユーザ情報を登録
export const insert =  async (req: Request, res: Response, next: NextFunction) =>{
	try {
        if (handleValidationErrors(req, res, '/auth/signup')) return;    
    

		const { id, name, password,confirmPassword } = req.body; // POSTデータを取得

		// IDの重複を確認
		const existingUser : User | null = await userSelectById(id);
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
        csrfToken: req.csrfToken()
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
        
         // csrfの検証で検証
        csrfProtection(req, res, async (err:any) => {
            if (err) {
                if (err.code === 'EBADCSRFTOKEN') {
                    console.log("CSRF token error");
                    return res.status(403).render('error/403', {
                        title: '403 - 不正なリクエスト',
                        error: 'フォームの有効期限が切れているか、不正な操作が検出されました。もう一度お試しください。',
                    });
                } else {
                    // その他のエラー（CSRF以外）
                    return next(err);
                }
            }

                // セッションの削除
            delete req.session.fileTypeError;
            delete req.session.oldInput;

            // ファイルが送信されている場合保存されているファイル名を取得
            try {
                const userId = (req.user as User).id;
                const user =  await userSelectById(userId);
                let filePath = user && user.img_path;

                if (req.file) {
                    // 既に保存されているデフォルト画像以外の画像を削除
                    if (user?.img_path && user.img_path.startsWith('/uploads/') && user.img_path !== '/uploads/default-img.png') {
                        
                        const oldFilePath = user.img_path.replace('/uploads/', 'uploads/');
                        
                        const { error } = await supabase.storage
                            .from('avatars') //  バケット名
                            .remove([oldFilePath]); // ディレクトリ/ファイル名を指定

                        //　古い画像の削除に失敗 
                        if (error) {
                            console.error('古い画像の削除に失敗しました:', error.message);
                        }
                    }
                    

                    // /tmp/uploads/ に保存されているローカルファイルパスを作る
                    const localFilePath = path.join('/tmp/uploads/',req.file.filename);
    
                    // ファイルの内容を読み込む
                    const fileBuffer = await fs.promises.readFile(localFilePath);
                    const supabaseFilePath = `uploads/${req.file.filename}`;

                     // Supabase ストレージへアップロード
                    const { error: uploadError } = await supabase.storage
                        .from('avatars') // バケット名に置き換えてください
                        .upload(supabaseFilePath, fileBuffer, {
                            contentType: req.file.mimetype,
                            upsert: true,
                        });

                    // 一時ファイル削除
                    await deleteFileIfExists(`${req.file.filename}`);

                     if (uploadError) {
                        console.error('Supabaseファイルアップロードエラー:', uploadError);
                        req.flash('uploadError', 'ファイルのアップロードに失敗しました。');
                        return res.redirect('/auth/edit');
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
    });
};



// GitHub認証のコールバック関数
export const gitHubCallback = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.redirect('/auth/login'); // ユーザーが取得できなかった場合
  }

  // セッションIDの再生成（セッション固定攻撃対策）
  req.session.regenerate((err) => {
    if (err) {
      console.error(err);
      const error = new Error() as any;
      error.status = 500;
      return next(error);
    }

    // パスポートにログイン情報を保存
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        const error = new Error() as any;
        error.status = 500;
        return next(error);
      }

      // セッションの保存
      req.session.save((err) => {
        if (err) {
          console.error(err);
          const error = new Error() as any;
          error.status = 500;
          return next(error);
        }

        res.redirect('/task');
      });
    });
  });
};

