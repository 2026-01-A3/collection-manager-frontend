import { Injectable, signal } from '@angular/core';

export interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private state = signal<ConfirmationOptions | null>(null);
  isOpen = this.state.asReadonly();

  confirm(options: ConfirmationOptions | string): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmationOptions: ConfirmationOptions =
        typeof options === 'string' ? { message: options } : options;

      this.state.set({
        ...confirmationOptions,
        title: confirmationOptions.title || 'Confirmação',
        confirmText: confirmationOptions.confirmText || 'Confirmar',
        cancelText: confirmationOptions.cancelText || 'Cancelar',
        resolve,
      });
    });
  }

  handleAction(confirmed: boolean): void {
    const current = this.state();
    if (current?.resolve) {
      current.resolve(confirmed);
    }
    this.state.set(null);
  }
}
