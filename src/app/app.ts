import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

import { ConfirmationModal } from './shared/confirmation-modal/confirmation-modal';
import { AlertModal } from './shared/alert-modal/alert-modal';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ConfirmationModal, AlertModal],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Collection Manager');
  currentUser = computed(() => this.authService.currentUser());

  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
