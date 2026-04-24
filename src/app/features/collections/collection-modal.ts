import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BinaryObjectPayload, Collection } from '../../models/collection.model';
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
      });
      this.collectionId = val.id;
      this.previewUrl.set(this.buildDataUrl(val.binary_object));
      this.existingFilename.set(val.binary_object?.filename ?? '');
    } else {
      this.formData.set({ name: '', category_id: 0 });
      this.collectionId = null;
      this.previewUrl.set(null);
      this.existingFilename.set('');
    }
    this.newFile.set(null);
  }
  get collection(): Collection | null {
    return this._collection;
  }

  @Input() categories: Category[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Collection>();

  collectionId: number | null = null;
  formData = signal({ name: '', category_id: 0 });
  isLoading = signal(false);

  newFile = signal<BinaryObjectPayload | null>(null);
  previewUrl = signal<string | null>(null);
  existingFilename = signal<string>('');

  isEdit = computed(() => this.collectionId !== null);
  title = computed(() => (this.isEdit() ? 'Editar Coleção' : 'Nova Coleção'));
  buttonText = computed(() => {
    if (this.isLoading()) return 'Salvando...';
    return this.isEdit() ? 'Salvar Alterações' : 'Adicionar Coleção';
  });

  constructor(
    private collectionService: CollectionService,
    private alertService: AlertService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] ?? '';
      const dotIdx = file.name.lastIndexOf('.');
      const extension = dotIdx >= 0 ? file.name.slice(dotIdx + 1).toLowerCase() : '';

      this.newFile.set({ base64, filename: file.name, extension });
      this.previewUrl.set(result);
    };
    reader.onerror = () => {
      this.alertService.error('Não foi possível ler o arquivo selecionado.');
    };
    reader.readAsDataURL(file);
  }

  private buildDataUrl(bin: { base64: string; extension: string } | null | undefined): string | null {
    if (!bin) return null;
    const ext = bin.extension.toLowerCase();
    const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${bin.base64}`;
  }

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

    const payload = {
      name: data.name,
      category_id: data.category_id,
      binary_object: this.newFile(),
    };

    const obs = this.isEdit()
      ? this.collectionService.updateCollection(this.collectionId!, payload)
      : this.collectionService.addCollection(payload);

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
