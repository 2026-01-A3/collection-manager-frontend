import { Component, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Item } from '../../models/item.model';
import { BinaryObject, Collection } from '../../models/collection.model';
import { ItemService } from '../../services/item.service';
import { CollectionService } from '../../services/collection.service';
import { ItemModal } from './item-modal';
import { ConfirmationService } from '../../services/confirmation.service';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-item-list',
  imports: [CommonModule, RouterLink, ItemModal],
  templateUrl: './items.html',
  styleUrl: './items.scss',
})
export class ItemList implements OnDestroy {
  items = signal<Item[]>([]);
  collection = signal<Collection | null>(null);
  collectionId = signal<number>(0);

  isLoading = signal(false);
  showModal = signal(false);
  editingItem = signal<Item | null>(null);
  currentIndex = signal(0);

  private mobileMql: MediaQueryList | null =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 768px)')
      : null;
  private isMobile = signal<boolean>(this.mobileMql?.matches ?? false);
  private mqlListener = (e: MediaQueryListEvent) => this.isMobile.set(e.matches);

  itemsPerSlide = computed(() => (this.isMobile() ? 1 : 3));

  slides = computed<Item[][]>(() => {
    const list = this.items();
    const size = this.itemsPerSlide();
    const pages: Item[][] = [];
    for (let i = 0; i < list.length; i += size) {
      pages.push(list.slice(i, i + size));
    }
    return pages;
  });

  hasItems = computed(() => this.items().length > 0);
  hasMultiple = computed(() => this.slides().length > 1);

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemService,
    private collectionService: CollectionService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
  ) {
    this.mobileMql?.addEventListener('change', this.mqlListener);
    effect(() => {
      const total = this.slides().length;
      if (this.currentIndex() >= total) {
        this.currentIndex.set(Math.max(0, total - 1));
      }
    });
    const idParam = this.route.snapshot.paramMap.get('collectionId');
    const id = Number(idParam);
    if (!id) {
      this.alertService.error('Coleção inválida.');
      return;
    }
    this.collectionId.set(id);
    this.loadCollection();
    this.loadItems();
  }

  loadCollection(): void {
    this.collectionService.getCollections().subscribe({
      next: (list) => {
        const found = list.find((c) => c.id === this.collectionId()) ?? null;
        this.collection.set(found);
      },
      error: () => {
        this.alertService.error('Erro ao carregar coleção.');
      },
    });
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.itemService.getItemsByCollection(this.collectionId()).subscribe({
      next: (list) => {
        this.items.set(list);
        this.currentIndex.set(0);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao carregar itens.');
        this.isLoading.set(false);
      },
    });
  }

  imageSrc(bin: BinaryObject | null | undefined): string | null {
    if (!bin) return null;
    const ext = bin.extension.toLowerCase();
    const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${bin.base64}`;
  }

  prev(): void {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentIndex.update((i) => (i - 1 + total) % total);
  }

  next(): void {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentIndex.update((i) => (i + 1) % total);
  }

  goTo(i: number): void {
    this.currentIndex.set(i);
  }

  openAddModal(): void {
    this.editingItem.set(null);
    this.showModal.set(true);
  }

  openEditModal(item: Item): void {
    this.editingItem.set(item);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingItem.set(null);
  }

  onItemSaved(saved: Item): void {
    const isEdit = this.editingItem() !== null;
    if (isEdit) {
      this.items.update((list) => list.map((i) => (i.id === saved.id ? saved : i)));
    } else {
      this.items.update((list) => [...list, saved]);
      this.currentIndex.set(this.slides().length - 1);
    }
    this.closeModal();
  }

  ngOnDestroy(): void {
    this.mobileMql?.removeEventListener('change', this.mqlListener);
  }

  async deleteItem(item: Item): Promise<void> {
    const confirmed = await this.confirmationService.confirm(
      `Tem certeza que deseja deletar "${item.name}"?`
    );
    if (!confirmed) return;

    this.isLoading.set(true);
    this.itemService.deleteItem(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((i) => i.id !== item.id));
        const totalSlides = this.slides().length;
        if (this.currentIndex() >= totalSlides) {
          this.currentIndex.set(Math.max(0, totalSlides - 1));
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao deletar item.');
        this.isLoading.set(false);
      },
    });
  }
}
