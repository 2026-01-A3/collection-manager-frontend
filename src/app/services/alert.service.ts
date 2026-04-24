import { Injectable, signal } from '@angular/core';

export interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  resolve?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private state = signal<AlertOptions | null>(null);
  isOpen = this.state.asReadonly();

  error(options: AlertOptions | string): Promise<void> {
    return new Promise((resolve) => {
      const alertOptions: AlertOptions =
        typeof options === 'string' ? { message: options } : options;

      this.state.set({
        ...alertOptions,
        title: alertOptions.title || 'Erro',
        buttonText: alertOptions.buttonText || 'Fechar',
        resolve,
      });
    });
  }

  close(): void {
    const current = this.state();
    if (current?.resolve) {
      current.resolve();
    }
    this.state.set(null);
  }
}
