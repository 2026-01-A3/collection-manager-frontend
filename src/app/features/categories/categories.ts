import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Category, CategoryService } from '../../services/category';
import { CategoryEditModal } from './category-edit-modal';

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
  errorMessage = signal('');
  showEditModal = signal(false);
  editingCategory = signal<Category | null>(null);

  constructor(private categoryService: CategoryService) {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.categoryService.getCategories().subscribe({
      next: (list) => {
        this.categories.set(list);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Erro ao carregar categorias.');
        console.error(error);
        this.isLoading.set(false);
      },
    });
  }

  addCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) {
      this.errorMessage.set('Nome da categoria não pode ser vazio.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.categoryService.addCategory({ name }).subscribe({
      next: (saved) => {
        this.categories.update((current) => [...current, saved]);
        this.newCategoryName.set('');
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Erro ao adicionar categoria.');
        console.error(error);
        this.isLoading.set(false);
      },
    });
  }

  openEditModal(category: Category): void {
    this.editingCategory.set(category);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingCategory.set(null);
  }

  onCategorySaved(updated: Category): void {
    this.categories.update((current) =>
      current.map((c) => (c.id === updated.id ? updated : c))
    );
    this.errorMessage.set('');
    this.closeEditModal();
  }

  deleteCategory(id: number): void {
    const confirmed = confirm('Tem certeza que deseja deletar esta categoria?');
    if (!confirmed) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.categories.update((current) => current.filter((c) => c.id !== id));
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Erro ao deletar categoria.');
        console.error(error);
        this.isLoading.set(false);
      },
    });
  }
}
