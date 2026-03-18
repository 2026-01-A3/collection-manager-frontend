import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Category, CategoryService } from '../../services/category';

@Component({
  standalone: true,
  selector: 'app-category-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoryList {
  categories = signal<Category[]>([]);
  newCategoryName = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

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
}
