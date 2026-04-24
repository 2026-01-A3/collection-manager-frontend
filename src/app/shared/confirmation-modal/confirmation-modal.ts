import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  standalone: true,
  selector: 'app-confirmation-modal',
  imports: [CommonModule],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss',
})
export class ConfirmationModal {
  constructor(protected confirmationService: ConfirmationService) {}

  confirm(): void {
    this.confirmationService.handleAction(true);
  }

  cancel(): void {
    this.confirmationService.handleAction(false);
  }
}
