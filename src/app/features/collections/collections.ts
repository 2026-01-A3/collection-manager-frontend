import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { BinaryObject, Collection } from '../../models/collection.model';
import { Category } from '../../models/category.model';
import { CollectionService } from '../../services/collection.service';
import { CategoryService } from '../../services/category';
import { CollectionModal } from './collection-modal';
import { ConfirmationService } from '../../services/confirmation.service';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-collection-list',
  imports: [CommonModule, FormsModule, CollectionModal],
  templateUrl: './collections.html',
  styleUrl: './collections.scss',
})
export class CollectionList {
  collections = signal<Collection[]>([]);
  categories = signal<Category[]>([]);

  isLoading = signal(false);
  showModal = signal(false);
  editingCollection = signal<Collection | null>(null);
  openDropdownId = signal<number | null>(null);

  constructor(
    private collectionService: CollectionService,
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.loadCollections();
    this.loadCategories();
  }

  loadCollections(): void {
    this.isLoading.set(true);
    this.collectionService.getCollections().subscribe({
      next: (list) => {
        this.collections.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao carregar coleções.');
        this.isLoading.set(false);
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (list) => {
        this.categories.set(list);
      },
      error: () => {
        this.alertService.error('Erro ao carregar categorias.');
      }
    });
  }

  openAddModal(): void {
    this.editingCollection.set(null);
    this.showModal.set(true);
  }

  openEditModal(collection: Collection): void {
    this.toggleDropdown(null);
    this.editingCollection.set(collection);
    this.showModal.set(true);
  }

  openItems(collection: Collection): void {
    this.toggleDropdown(null);
    this.router.navigate(['/collections', collection.id, 'items']);
  }

  imageSrc(bin: BinaryObject | null | undefined): string | null {
    if (!bin) return null;
    const ext = bin.extension.toLowerCase();
    const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${bin.base64}`;
  }

  toggleDropdown(id: number | null): void {
    if (this.openDropdownId() === id) {
      this.openDropdownId.set(null);
    } else {
      this.openDropdownId.set(id);
    }
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCollection.set(null);
  }

  onCollectionSaved(saved: Collection): void {
    const isEdit = this.editingCollection() !== null;
    if (isEdit) {
      this.collections.update((current) =>
        current.map((c) => (c.id === saved.id ? saved : c))
      );
    } else {
      this.collections.update((current) => [...current, saved]);
    }
    this.closeModal();
  }

  async deleteCollection(id: number): Promise<void> {
    this.toggleDropdown(null);
    const confirmed = await this.confirmationService.confirm(
      'Tem certeza que deseja deletar esta coleção?'
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    this.collectionService.deleteCollection(id).subscribe({
      next: () => {
        this.collections.update((current) => current.filter((c) => c.id !== id));
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao deletar coleção.');
        this.isLoading.set(false);
      },
    });
  }
}
