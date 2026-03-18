import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category { id?: number; name: string; }

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API_BASE = environment.apiBase;
  constructor(private http: HttpClient) {}
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_BASE}/categories`);
  }
  addCategory(category: Omit<Category,'id'>): Observable<Category> {
    return this.http.post<Category>(`${this.API_BASE}/categories`, category);
  }
}