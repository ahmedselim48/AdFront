import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OpenAiService {
  constructor(private http: HttpClient){}
  createSmartReply(message: string){
    return this.http.post<{reply:string}>(`${environment.openAiProxyUrl}/smart-replies`, { message });
  }
}
