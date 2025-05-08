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
            cb(new Error('対応していないファイル形式です'));
        }
    }
});

// 古い画像を削除
export function deleteFileIfExists(relativePath: string): void {
    const filePath = path.join(__dirname, '../../public', relativePath);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
// 画像名を返す
export function getUploadedPath(file: Express.Multer.File): string {
    return file.filename;
}
