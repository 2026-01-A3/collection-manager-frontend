import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly API_BASE = environment.apiBase;
  constructor(private http: HttpClient) {}
  getCategories(search?: string): Observable<Category[]> {
    let params = new HttpParams();
    const trimmed = (search ?? '').trim();
    if (trimmed) params = params.set('search', trimmed);
    return this.http.get<Category[]>(`${this.API_BASE}/categories`, { params });
  }
  addCategory(category: Omit<Category,'id'>): Observable<Category> {
    return this.http.post<Category>(`${this.API_BASE}/categories`, category);
  }

  updateCategory(id: number, category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.put<Category>(`${this.API_BASE}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/categories/${id}`);
  }
}
