import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoryService } from '../../services/category';
import { Category } from '../../models/category.model';
import { CategoryModal } from './category-modal';
import { ConfirmationService } from '../../services/confirmation.service';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-category-list',
  imports: [CommonModule, FormsModule, CategoryModal],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoryList {
  categories = signal<Category[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  editingCategory = signal<Category | null>(null);
  openDropdownId = signal<number | null>(null);
  dropdownPos = signal<{ top: number; left: number } | null>(null);

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

  openAddModal(): void {
    this.editingCategory.set(null);
    this.showModal.set(true);
  }

  openEditModal(category: Category): void {
    this.toggleDropdown(null);
    this.editingCategory.set(category);
    this.showModal.set(true);
  }

  toggleDropdown(id: number | null, event?: MouseEvent): void {
    if (this.openDropdownId() === id) {
      this.openDropdownId.set(null);
      this.dropdownPos.set(null);
      return;
    }
    if (id !== null && event) {
      const btn = event.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      const menuWidth = 140;
      const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8);
      this.dropdownPos.set({ top: rect.bottom + 4, left: Math.max(8, left) });
    } else {
      this.dropdownPos.set(null);
    }
    this.openDropdownId.set(id);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.openDropdownId() === null) return;
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.dropdown')) {
      this.openDropdownId.set(null);
      this.dropdownPos.set(null);
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    if (this.openDropdownId() !== null) {
      this.openDropdownId.set(null);
      this.dropdownPos.set(null);
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCategory.set(null);
  }

  onCategorySaved(saved: Category): void {
    const isEdit = this.editingCategory() !== null;
    if (isEdit) {
      this.categories.update((current) =>
        current.map((c) => (c.id === saved.id ? saved : c))
      );
    } else {
      this.categories.update((current) => [...current, saved]);
    }
    this.closeModal();
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
