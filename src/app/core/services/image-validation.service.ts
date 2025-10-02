import { Injectable } from '@angular/core';

export interface ImageValidationResult {
  validFiles: File[];
  skippedFiles: SkippedFileInfo[];
  totalSkipped: number;
  hasErrors: boolean;
  errorSummary: string;
}

export interface SkippedFileInfo {
  fileName: string;
  reason: 'unsupported_format' | 'oversized' | 'empty_file' | 'invalid_mime';
  details: string;
  suggestedAction?: string;
}

@Injectable({ providedIn: 'root' })
export class ImageValidationService {
  private readonly supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10 MB

  /**
   * Validates image files and filters out unsupported formats
   * @param files Array of files to validate
   * @param logSkipped Whether to log skipped files to console (default: true)
   * @returns Object containing valid files and detailed skipped file information
   */
  validateImageFiles(files: File[], logSkipped: boolean = true): ImageValidationResult {
    const validFiles: File[] = [];
    const skippedFiles: SkippedFileInfo[] = [];

    files.forEach(file => {
      const validationResult = this.validateSingleFile(file);
      
      if (validationResult.isValid) {
        validFiles.push(file);
      } else {
        skippedFiles.push(validationResult.skipInfo!);
        if (logSkipped) {
          console.log(`⏭ Skipped ${file.name}: ${validationResult.skipInfo!.details}`);
        }
      }
    });

    const errorSummary = this.generateErrorSummary(skippedFiles);

    return {
      validFiles,
      skippedFiles,
      totalSkipped: skippedFiles.length,
      hasErrors: skippedFiles.length > 0,
      errorSummary
    };
  }

  /**
   * Checks if a single file is a supported image format
   * @param file File to check
   * @returns true if supported, false otherwise
   */
  isSupportedImageFormat(file: File): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return fileExtension ? this.supportedFormats.includes(fileExtension) : false;
  }

  /**
   * Validates a single file and returns detailed information
   * @param file File to validate
   * @returns Validation result with detailed information
   */
  private validateSingleFile(file: File): { isValid: boolean; skipInfo?: SkippedFileInfo } {
    // Check if file is empty
    if (file.size === 0) {
      return {
        isValid: false,
        skipInfo: {
          fileName: file.name,
          reason: 'empty_file',
          details: 'File is empty (0 bytes)',
          suggestedAction: 'Please select a valid image file'
        }
      };
    }

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.supportedFormats.includes(fileExtension)) {
      return {
        isValid: false,
        skipInfo: {
          fileName: file.name,
          reason: 'unsupported_format',
          details: `Unsupported format: ${fileExtension || 'unknown'}`,
          suggestedAction: `Convert to one of: ${this.supportedFormats.join(', ').toUpperCase()}`
        }
      };
    }

    // Check MIME type
    const supportedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedMimeTypes.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        skipInfo: {
          fileName: file.name,
          reason: 'invalid_mime',
          details: `Invalid file type: ${file.type}`,
          suggestedAction: 'Ensure the file is a valid image'
        }
      };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        skipInfo: {
          fileName: file.name,
          reason: 'oversized',
          details: `File too large: ${this.formatFileSize(file.size)} (max: 10 MB)`,
          suggestedAction: 'Compress the image or choose a smaller file'
        }
      };
    }

    return { isValid: true };
  }

  /**
   * Gets the list of supported image formats
   * @returns Array of supported file extensions
   */
  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }

  /**
   * Gets the maximum allowed file size in bytes
   * @returns Maximum file size in bytes
   */
  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  /**
   * Generates a user-friendly error summary
   * @param skippedFiles Array of skipped file information
   * @returns Summary string for display to user
   */
  private generateErrorSummary(skippedFiles: SkippedFileInfo[]): string {
    if (skippedFiles.length === 0) return '';

    const reasonCounts = skippedFiles.reduce((acc, file) => {
      acc[file.reason] = (acc[file.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summaryParts: string[] = [];
    
    if (reasonCounts['unsupported_format']) {
      summaryParts.push(`${reasonCounts['unsupported_format']} file(s) with unsupported format`);
    }
    if (reasonCounts['oversized']) {
      summaryParts.push(`${reasonCounts['oversized']} file(s) too large`);
    }
    if (reasonCounts['empty_file']) {
      summaryParts.push(`${reasonCounts['empty_file']} empty file(s)`);
    }
    if (reasonCounts['invalid_mime']) {
      summaryParts.push(`${reasonCounts['invalid_mime']} file(s) with invalid type`);
    }

    return `Skipped ${skippedFiles.length} file(s): ${summaryParts.join(', ')}`;
  }

  /**
   * Gets detailed validation information for display
   * @param result Validation result
   * @returns Formatted information for user display
   */
  getValidationSummary(result: ImageValidationResult): string {
    if (!result.hasErrors) {
      return `All ${result.validFiles.length} files are valid and ready for upload.`;
    }

    let summary = `${result.validFiles.length} files are valid for upload.`;
    if (result.totalSkipped > 0) {
      summary += ` ${result.errorSummary}`;
    }
    return summary;
  }

  /**
   * Gets suggestions for fixing validation errors
   * @param skippedFiles Array of skipped file information
   * @returns Array of user-friendly suggestions
   */
  getValidationSuggestions(skippedFiles: SkippedFileInfo[]): string[] {
    const suggestions = new Set<string>();
    
    skippedFiles.forEach(file => {
      if (file.suggestedAction) {
        suggestions.add(file.suggestedAction);
      }
    });

    return Array.from(suggestions);
  }

  /**
   * Formats file size for display
   * @param bytes File size in bytes
   * @returns Formatted file size string
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
