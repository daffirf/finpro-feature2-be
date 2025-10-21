import multer from 'multer'
import { Request } from 'express'
import { ApiError } from '@/utils/api-error'

const storage = multer.memoryStorage()

const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ApiError(400, 'Format file harus JPG, JPEG, PNG, atau GIF'))
  }
}

export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 1024 * 1024
  }
})

export const handleMulterError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Ukuran file terlalu besar (maksimal 1MB)' 
      })
    }
    return res.status(400).json({ 
      error: `Upload error: ${err.message}` 
    })
  }
  next(err)
}

