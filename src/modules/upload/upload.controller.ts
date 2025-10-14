import { Request, Response, NextFunction } from 'express'
import { UploadService } from './upload.service'

export class UploadController {
  private uploadService: UploadService

  constructor() {
    this.uploadService = new UploadService()
  }

  getFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get path from request path, removing /uploads prefix
      const requestPath = req.path.startsWith('/') ? req.path.substring(1) : req.path
      const filePath = requestPath ? requestPath.split('/') : []
      
      if (!filePath.length) {
        return res.status(400).json({ error: 'File path is required' })
      }

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
