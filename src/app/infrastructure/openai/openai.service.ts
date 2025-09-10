import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OpenAiService {
  constructor(private http: HttpClient){}
  createSmartReply(message: string){
    // Mock response for now since the endpoint doesn't exist
    return new Promise<{reply: string}>(resolve => {
      setTimeout(() => {
        resolve({
          reply: `شكراً لاهتمامك! سأرد عليك قريباً. ${message.includes('سعر') ? 'السعر متاح للتفاوض.' : ''}`
        });
      }, 1000);
    });
  }
}
