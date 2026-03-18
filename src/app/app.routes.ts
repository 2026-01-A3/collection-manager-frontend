import { Routes } from '@angular/router';
import { CategoryList } from './features/categories/categories';

export const routes: Routes = [
  { path: '', redirectTo: 'categories', pathMatch: 'full' },
  { path: 'categories', component: CategoryList },
];
