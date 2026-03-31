import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from '../../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['../login/login.scss']
})
export class RegisterComponent {
  userData: RegisterRequest = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    const currentData = { ...this.userData };
    this.authService.register(currentData).subscribe({
      next: () => {
        this.successMessage = 'Usuário registrado com sucesso!';
        this.userData = {
          name: '',
          email: '',
          password: '',
          role: 'USER'
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error?.error || 'Erro ao realizar registro';
        this.cdr.detectChanges();
      }
    });
  }
}
