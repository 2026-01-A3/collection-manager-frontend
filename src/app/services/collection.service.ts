import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Collection, CreateCollectionRequest, UpdateCollectionRequest } from '../models/collection.model';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  private readonly API_BASE = environment.apiBase;

  constructor(private http: HttpClient) { }

  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.API_BASE}/collections`);
  }

  addCollection(collection: CreateCollectionRequest): Observable<Collection> {
    return this.http.post<Collection>(`${this.API_BASE}/collections`, collection);
  }

  updateCollection(id: number, collection: UpdateCollectionRequest): Observable<Collection> {
    return this.http.put<Collection>(`${this.API_BASE}/collections/${id}`, collection);
  }

  deleteCollection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/collections/${id}`);
  }
}
