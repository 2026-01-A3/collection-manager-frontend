import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-alert-modal',
  imports: [CommonModule],
  templateUrl: './alert-modal.html',
  styleUrl: './alert-modal.scss',
})
export class AlertModal {
  constructor(protected alertService: AlertService) {}

  onClose(): void {
    this.alertService.close();
  }
}
