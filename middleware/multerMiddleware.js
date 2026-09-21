import multer from 'multer';
import DataParser from 'datauri/parser.js';
import path from 'path';

const storage = multer.memoryStorage();

// 5 MB cap, applied to all uploads (avatars and resumes)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const parser = new DataParser();

// Generic buffer -> data URI formatter (works for images and PDFs)
const formatBuffer = (file) => {
  const fileExtension = path.extname(file.originalname).toString();
  return parser.format(fileExtension, file.buffer).content;
};

export const formatImage = (file) => formatBuffer(file);

export const formatPDF = (file) => formatBuffer(file);

export default upload;
