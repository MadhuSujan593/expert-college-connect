import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  constructor(private readonly configService: ConfigService) {
    // Ensure upload directories exist
    this.ensureUploadDirectories();
  }

  private ensureUploadDirectories() {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const profilePicsDir = path.join(uploadsDir, 'profile-pics');
    const resumesDir = path.join(uploadsDir, 'resumes');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(profilePicsDir)) {
      fs.mkdirSync(profilePicsDir, { recursive: true });
    }
    if (!fs.existsSync(resumesDir)) {
      fs.mkdirSync(resumesDir, { recursive: true });
    }
  }

  /**
   * Get multer configuration for profile pictures
   */
  getProfilePictureMulterConfig(): multer.Options {
    return {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(process.cwd(), 'uploads', 'profile-pics'));
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    };
  }

  /**
   * Get multer configuration for resumes
   */
  getResumeMulterConfig(): multer.Options {
    return {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(process.cwd(), 'uploads', 'resumes'));
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    };
  }

  /**
   * Process uploaded profile picture
   */
  processProfilePicture(file: Express.Multer.File): { url: string; filename: string } {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const baseUrl = this.configService.get('BASE_URL');
    const url = `${baseUrl}/uploads/profile-pics/${file.filename}`;

    return {
      url,
      filename: file.filename,
    };
  }

  /**
   * Process uploaded resume
   */
  processResume(file: Express.Multer.File): { url: string; filename: string; originalName: string } {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const baseUrl = this.configService.get('BASE_URL');
    const url = `${baseUrl}/uploads/resumes/${file.filename}`;

    return {
      url,
      filename: file.filename,
      originalName: file.originalname,
    };
  }

  /**
   * Delete file from filesystem
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Get file info
   */
  getFileInfo(filePath: string): { exists: boolean; size?: number; mtime?: Date } {
    try {
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          exists: true,
          size: stats.size,
          mtime: stats.mtime,
        };
      }
      return { exists: false };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Validate file size
   */
  validateFileSize(file: Express.Multer.File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  /**
   * Validate file type
   */
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    return `${uuidv4()}${ext}`;
  }
}
