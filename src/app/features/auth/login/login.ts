import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    this.errorMessage = '';
    this.authService.login(this.credentials).subscribe({
      next: async () => {
        await this.router.navigate(['/categories']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erro ao realizar login';
      }
    });
  }
}
