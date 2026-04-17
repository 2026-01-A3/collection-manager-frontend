import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category';
import { AlertService } from '../../services/alert.service';

@Component({
  standalone: true,
  selector: 'app-category-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './category-modal.html',
  styleUrl: './category-modal.scss',
})
export class CategoryModal {
  private _category: Category | null = null;
  @Input() set category(val: Category | null) {
    this._category = val;
    if (val) {
      this.formData.set({ name: val.name });
      this.categoryId = val.id ?? null;
    } else {
      this.formData.set({ name: '' });
      this.categoryId = null;
    }
  }
  get category(): Category | null {
    return this._category;
  }

  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Category>();

  categoryId: number | null = null;
  formData = signal({ name: '' });
  isLoading = signal(false);

  isEdit = computed(() => this.categoryId !== null);
  title = computed(() => (this.isEdit() ? 'Editar Categoria' : 'Nova Categoria'));
  buttonText = computed(() => {
    if (this.isLoading()) return 'Salvando...';
    return this.isEdit() ? 'Salvar Alterações' : 'Adicionar Categoria';
  });

  constructor(
    private categoryService: CategoryService,
    private alertService: AlertService
  ) {}

  save(): void {
    const data = this.formData();
    if (!data.name.trim()) {
      this.alertService.error('Nome não pode ser vazio.');
      return;
    }

    this.isLoading.set(true);

    const obs = this.isEdit()
      ? this.categoryService.updateCategory(this.categoryId!, data)
      : this.categoryService.addCategory(data);

    obs.subscribe({
      next: (saved) => {
        this.onSave.emit(saved);
        this.isLoading.set(false);
      },
      error: () => {
        this.alertService.error(
          `Erro ao ${this.isEdit() ? 'atualizar' : 'adicionar'} categoria.`
        );
        this.isLoading.set(false);
      },
    });
  }
}
