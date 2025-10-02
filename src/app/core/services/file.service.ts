import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];

  private isSupportedFormat(file: File): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return fileExtension ? this.supportedFormats.includes(fileExtension) : false;
  }

  async compressImage(file: File, quality = 0.8, maxWidth = 1600): Promise<Blob> {
    if (!this.isSupportedFormat(file)) {
      console.log(`⏭ Skipped unsupported format: ${file.name}`);
      throw new Error(`Unsupported image format: ${file.name}`);
    }
    
    const img = await this.loadImage(file);
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement('canvas');
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/jpeg', quality));
  }

  async cropImage(file: File, x: number, y: number, width: number, height: number): Promise<Blob> {
    if (!this.isSupportedFormat(file)) {
      console.log(`⏭ Skipped unsupported format: ${file.name}`);
      throw new Error(`Unsupported image format: ${file.name}`);
    }
    
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    return await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/jpeg', 0.9));
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }
}
