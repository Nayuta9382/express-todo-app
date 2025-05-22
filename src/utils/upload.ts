import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    // 保存先の設定
    destination: (req,file,cb) =>{
        const uploadPath = 'public/uploads/';
        // アップロード先が存在しない場合ディレクトリを作成
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath,{recursive:true});
        }
        cb(null, uploadPath);
    },
    // ファイル名の設定
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = `user-${Date.now()}`;
        let fileName = `${baseName}${ext}`;

        // ファイル名が240文字を超える場合は、ファイル名を切り詰める
        if (fileName.length > 240) {
            const maxLength = 240 - ext.length;  // 拡張子の長さを考慮して制限
            fileName = `${baseName.slice(0, maxLength)}${ext}`;
        }

        cb(null, fileName);
    }
});

// multerインスタンスの設定
export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif'];

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            // コントローラー側で不正なファイルが送信されていることを保持するセッション
            req.session.fileTypeError = true;
            cb(null, false);  // PDFも含めて許可していないファイルは拒否
        }
    }
});

// 古い画像を削除
export async function deleteFileIfExists(relativePath: string): Promise<void>  {
    const uploadDir = path.join(__dirname, '../../public/');
    const filePath = path.normalize(path.join(uploadDir, relativePath));
    
    // uploads フォルダ外のパスを拒否（ディレクトリトラバーサル対策）
    if (!filePath.startsWith(uploadDir)) {
        console.warn('不正なファイルパスが指定されました:', filePath);
        return;
    }

     try {
        await fs.promises.access(filePath, fs.constants.F_OK);
        await fs.promises.unlink(filePath);
    } catch (err) {
        // ファイルが存在しない場合やその他のエラーは無視
        console.log(err);
        
    }
}
// 画像名を返す
export function getUploadedPath(file: Express.Multer.File): string {
    return file.filename;
}
