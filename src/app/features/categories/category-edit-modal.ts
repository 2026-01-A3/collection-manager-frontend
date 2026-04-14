import { Component, signal, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, CategoryService } from '../../services/category';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-category-edit-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './category-edit-modal.html',
  styleUrl: './category-edit-modal.scss',
})
export class CategoryEditModal {
  @Input() set category(value: Category | null) {
    if (value) {
      this.editingCategory.set(value);
      this.editName.set(value.name);
    }
  }

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Category>();

  editingCategory = signal<Category | null>(null);
  editName = signal('');
  isLoading = signal(false);

  constructor(
    private categoryService: CategoryService,
    private alertService: AlertService
  ) {}

  onSave(): void {
    const name = this.editName().trim();
    if (!name) {
      this.alertService.error('Nome da categoria não pode ser vazio.');
      return;
    }

    const category = this.editingCategory();
    if (!category || !category.id) {
      this.alertService.error('Erro: categoria inválida.');
      return;
    }

    this.isLoading.set(true);

    this.categoryService.updateCategory(category.id, { name }).subscribe({
      next: (updated) => {
        this.isLoading.set(false);
        this.save.emit(updated);
        this.onClose();
      },
      error: (error) => {
        this.isLoading.set(false);
        const errorMsg =
          error.error?.message || error.statusText || 'Erro ao atualizar categoria.';
        this.alertService.error(errorMsg);
      },
    });
  }

  onClose(): void {
    this.editingCategory.set(null);
    this.editName.set('');
    this.close.emit();
  }
}

