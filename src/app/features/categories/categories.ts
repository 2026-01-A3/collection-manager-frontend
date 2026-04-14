import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Category, CategoryService } from '../../services/category';
import { CategoryEditModal } from './category-edit-modal';
import { ConfirmationService } from '../../services/confirmation.service';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-category-list',
  imports: [CommonModule, FormsModule, CategoryEditModal],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoryList {
  categories = signal<Category[]>([]);
  newCategoryName = signal('');
  isLoading = signal(false);
  showEditModal = signal(false);
  editingCategory = signal<Category | null>(null);
  openDropdownId = signal<number | null>(null);

  constructor(
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
  ) {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);

    this.categoryService.getCategories().subscribe({
      next: (list) => {
        this.categories.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao carregar categorias.');
        this.isLoading.set(false);
      },
    });
  }

  addCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) {
      this.alertService.error('Nome da categoria não pode ser vazio.');
      return;
    }

    this.isLoading.set(true);

    this.categoryService.addCategory({ name }).subscribe({
      next: (saved) => {
        this.categories.update((current) => [...current, saved]);
        this.newCategoryName.set('');
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao adicionar categoria.');
        this.isLoading.set(false);
      },
    });
  }

  openEditModal(category: Category): void {
    this.toggleDropdown(null);
    this.editingCategory.set(category);
    this.showEditModal.set(true);
  }

  toggleDropdown(id: number | null): void {
    if (this.openDropdownId() === id) {
      this.openDropdownId.set(null);
    } else {
      this.openDropdownId.set(id);
    }
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingCategory.set(null);
  }

  onCategorySaved(updated: Category): void {
    this.categories.update((current) =>
      current.map((c) => (c.id === updated.id ? updated : c))
    );
    this.closeEditModal();
  }

  async deleteCategory(id: number): Promise<void> {
    this.toggleDropdown(null);
    const confirmed = await this.confirmationService.confirm(
      'Tem certeza que deseja deletar esta categoria?'
    );
    if (!confirmed) return;

    this.isLoading.set(true);

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.categories.update((current) => current.filter((c) => c.id !== id));
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao deletar categoria.');
        this.isLoading.set(false);
      },
    });
  }
}
