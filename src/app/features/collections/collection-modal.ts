import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Collection } from '../../models/collection.model';
import { Category } from '../../models/category.model';
import { CollectionService } from '../../services/collection.service';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-collection-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './collection-modal.html',
  styleUrl: './collection-modal.scss',
})
export class CollectionModal {
  private _collection: Collection | null = null;
  @Input() set collection(val: Collection | null) {
    this._collection = val;
    if (val) {
      this.formData.set({
        name: val.name,
        category_id: val.category_id,
        image_url: val.image_url || ''
      });
      this.collectionId = val.id;
    } else {
      this.formData.set({
        name: '',
        category_id: 0,
        image_url: ''
      });
      this.collectionId = null;
    }
  }
  get collection(): Collection | null {
    return this._collection;
  }

  @Input() categories: Category[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Collection>();

  collectionId: number | null = null;
  formData = signal({
    name: '',
    category_id: 0,
    image_url: ''
  });
  isLoading = signal(false);

  isEdit = computed(() => this.collectionId !== null);
  title = computed(() => this.isEdit() ? 'Editar Coleção' : 'Nova Coleção');
  buttonText = computed(() => {
    if (this.isLoading()) return 'Salvando...';
    return this.isEdit() ? 'Salvar Alterações' : 'Adicionar Coleção';
  });

  constructor(
    private collectionService: CollectionService,
    private alertService: AlertService
  ) {}

  save(): void {
    const data = this.formData();
    if (!data.name.trim()) {
      this.alertService.error('Nome não pode ser vazio.');
      return;
    }
    if (data.category_id === 0) {
      this.alertService.error('Selecione uma categoria.');
      return;
    }

    this.isLoading.set(true);

    const obs = this.isEdit()
      ? this.collectionService.updateCollection(this.collectionId!, data)
      : this.collectionService.addCollection(data);

    obs.subscribe({
      next: (saved) => {
        this.onSave.emit(saved);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error(`Erro ao ${this.isEdit() ? 'atualizar' : 'adicionar'} coleção.`);
        this.isLoading.set(false);
      },
    });
  }
}
