import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BinaryObjectPayload } from '../../models/collection.model';
import { Item } from '../../models/item.model';
import { ItemService } from '../../services/item.service';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-item-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './item-modal.html',
  styleUrl: './item-modal.scss',
})
export class ItemModal {
  private _item: Item | null = null;
  @Input() set item(val: Item | null) {
    this._item = val;
    if (val) {
      this.formData.set({
        name: val.name,
        description: val.description ?? '',
        price: val.price,
      });
      this.itemId = val.id;
      this.previewUrl.set(this.buildDataUrl(val.binary_object));
      this.existingFilename.set(val.binary_object?.filename ?? '');
    } else {
      this.formData.set({ name: '', description: '', price: 0 });
      this.itemId = null;
      this.previewUrl.set(null);
      this.existingFilename.set('');
    }
    this.newFile.set(null);
  }
  get item(): Item | null {
    return this._item;
  }

  @Input() collectionId: number = 0;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Item>();

  itemId: number | null = null;
  formData = signal<{ name: string; description: string; price: number }>({
    name: '',
    description: '',
    price: 0,
  });
  isLoading = signal(false);

  newFile = signal<BinaryObjectPayload | null>(null);
  previewUrl = signal<string | null>(null);
  existingFilename = signal<string>('');

  isEdit = computed(() => this.itemId !== null);
  title = computed(() => (this.isEdit() ? 'Editar Item' : 'Novo Item'));
  buttonText = computed(() => {
    if (this.isLoading()) return 'Salvando...';
    return this.isEdit() ? 'Salvar Alterações' : 'Adicionar Item';
  });

  constructor(
    private itemService: ItemService,
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
    if (data.price < 0 || isNaN(Number(data.price))) {
      this.alertService.error('Valor inválido.');
      return;
    }
    if (!this.collectionId) {
      this.alertService.error('Coleção inválida.');
      return;
    }

    this.isLoading.set(true);

    const trimmedDescription = data.description.trim();
    const payload = {
      name: data.name,
      description: trimmedDescription === '' ? null : trimmedDescription,
      price: Number(data.price),
      collection_id: this.collectionId,
      binary_object: this.newFile(),
    };

    const obs = this.isEdit()
      ? this.itemService.updateItem(this.itemId!, payload)
      : this.itemService.addItem(payload);

    obs.subscribe({
      next: (saved) => {
        this.onSave.emit(saved);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error(`Erro ao ${this.isEdit() ? 'atualizar' : 'adicionar'} item.`);
        this.isLoading.set(false);
      },
    });
  }
}
