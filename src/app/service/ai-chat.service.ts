import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/table.model';
import { ChatResponse } from '../models/message.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {

  private baseUrl = 'http://localhost:5000/ai';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  sendMessage(
    roomId: number | null,
    message: string,
    conversationId?: number | null
  ): Observable<ApiResponse<ChatResponse>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<ApiResponse<ChatResponse>>(
      `${this.baseUrl}/chat`,
      {
        room_id: roomId,
        message,
        conversation_id: conversationId ?? null
      },
      { headers }
    );
  }
}