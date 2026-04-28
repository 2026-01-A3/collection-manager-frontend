import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

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
  protected readonly title = signal('Acervo');
  currentUser = computed(() => this.authService.currentUser());
  theme = computed(() => this.themeService.theme());
  drawerOpen = signal(false);

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleDrawer(): void {
    this.drawerOpen.update((v) => !v);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  logout() {
    this.authService.logout();
    this.closeDrawer();
  }
}
