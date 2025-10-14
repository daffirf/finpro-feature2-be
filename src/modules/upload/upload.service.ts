import { readFile, access } from 'fs/promises'
import { join } from 'path'
import { ApiError } from '@/lib/errors'

export class UploadService {
  
  async getFile(filePath: string[]) {
    try {
      const fullPath = join(process.cwd(), 'uploads', ...filePath)
      
      // Check if file exists
      await access(fullPath)
      
      // Read file
      const file = await readFile(fullPath)
      
      // Determine content type based on file extension
      const extension = filePath[filePath.length - 1].split('.').pop()?.toLowerCase()
      const contentType = this.getContentType(extension || '')
      
      return {
        file,
        contentType,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        }
      }
    } catch (error) {
      throw new ApiError(404, 'File not found')
    }
  }

  private getContentType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'json': 'application/json'
    }
    
    return mimeTypes[extension] || 'application/octet-stream'
  }
}
