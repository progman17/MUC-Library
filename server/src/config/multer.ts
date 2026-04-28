import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Base uploads directory — always relative to THIS file, not process.cwd()
const UPLOADS_BASE = path.join(__dirname, '../../uploads');

const ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let subDir = 'misc';
        if (file.fieldname === 'profile') subDir = 'profiles';
        else if (file.fieldname === 'cover') subDir = 'books-covers';
        else if (file.fieldname === 'pdf') subDir = 'books-pdfs';

        const dest = path.join(UPLOADS_BASE, subDir);
        ensureDir(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ storage });
