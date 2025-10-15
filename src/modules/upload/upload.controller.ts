import { Request, Response, NextFunction } from 'express'
import { UploadService } from './upload.service'

export class UploadController {
  private uploadService: UploadService

  constructor() {
    this.uploadService = new UploadService()
  }

  getFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get file path from route parameters
      const { folder, filename } = req.params
      
      if (!filename) {
        return res.status(400).json({ error: 'File path is required' })
      }

      // Build file path array
      const filePath = folder ? [folder, filename] : [filename]

      const result = await this.uploadService.getFile(filePath)
      
      // Set headers
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
      
      // Send file
      res.send(result.file)
    } catch (error) {
      next(error)
    }
  }
}
