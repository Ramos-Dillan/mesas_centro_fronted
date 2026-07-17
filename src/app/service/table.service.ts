import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TableItem } from '../models/table.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private baseUrl = 'https://mesas-centro-backend.onrender.com/tables';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TableItem[]> {
    return this.http.get<TableItem[]>(`${this.baseUrl}/getAll`);
  }

  getById(id: number): Observable<TableItem> {
    return this.http.get<TableItem>(`${this.baseUrl}/get/${id}`);
  }

  create(formData: FormData): Observable<TableItem> {
    return this.http.post<TableItem>(`${this.baseUrl}/create`, formData);
  }

  update(id: number, formData: FormData): Observable<TableItem> {
    return this.http.put<TableItem>(`${this.baseUrl}/update/${id}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}
