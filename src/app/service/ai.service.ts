import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecommendationResponse } from '../models/recommendation.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private baseUrl = 'http://localhost:5000/ai';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  recommend(image: File): Observable<RecommendationResponse> {
    const formData = new FormData();
    formData.append('image', image);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<RecommendationResponse>(
      `${this.baseUrl}/recommend`,
      formData,
      { headers }
    );
  }
}