import { Routes } from '@angular/router';
import { CategoryList } from './features/categories/categories';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'categories',
    component: CategoryList,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'categories', pathMatch: 'full' },
  { path: '**', redirectTo: 'categories' }
];
