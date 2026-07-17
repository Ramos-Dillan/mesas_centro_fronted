import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TableService } from '../../service/table.service';
import { TableItem } from '../../models/table.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.scss']
})
export class Catalogo implements OnInit {
  tables: TableItem[] = [];
  loading = true;
  error: string | null = null;

  showForm = false;
  saving = false;
  saveError: string | null = null;
  saveSuccess = false;

  editingId: number | null = null;

  deletingId: number | null = null;
  deleteError: string | null = null;

  form: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private tableService: TableService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.form = this.fb.group({
      name: [''],
      style: [''],
      material: [''],
      color: [''],
      shape: [''],
      width: [''],
      depth: [''],
      height: [''],
      diameter: [''],
      price: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.loading = true;
    this.error = null;

    this.tableService.getAll().subscribe({
      next: (response: any) => {
        const data = response?.data ?? response;
        this.tables = Array.isArray(data) ? data : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando catálogo:', err);
        this.error = 'No se pudo cargar el catálogo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrl(path: string): string {
    if (!path) return 'assets/placeholder.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${environment.apiUrl}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  }

  toggleForm(): void {
    this.showForm = !this.showForm;

    if (!this.showForm) {
      this.resetForm();
    }

    this.saveError = null;
    this.saveSuccess = false;
  }

  resetForm(): void {
    this.form.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.editingId = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  get isRoundShape(): boolean {
    const shape = (this.form.value.shape || '').toString().trim().toLowerCase();
    return shape === 'redonda';
  }

  isRoundTable(table: TableItem): boolean {
    return (table.shape || '').toString().trim().toLowerCase() === 'redonda';
  }

  get isEditing(): boolean {
    return this.editingId !== null;
  }

  editTable(table: TableItem): void {
    this.editingId = table.id;
    this.saveError = null;
    this.saveSuccess = false;

    this.form.patchValue({
      name: table.name || '',
      style: table.style || '',
      material: table.material || '',
      color: table.color || '',
      shape: table.shape || '',
      width: table.width ?? '',
      depth: table.depth ?? '',
      height: table.height ?? '',
      diameter: table.diameter ?? '',
      price: table.price ?? '',
      description: table.description || ''
    });

    this.selectedFile = null;
    this.previewUrl = this.getImageUrl(table.image_url);

    this.showForm = true;
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.showForm = false;
    this.resetForm();
    this.saveError = null;
    this.saveSuccess = false;
  }

  deleteTable(table: TableItem): void {
    const confirmed = window.confirm(`¿Seguro que quieres eliminar "${table.name}"? Esta acción no se puede deshacer.`);

    if (!confirmed) return;

    this.deletingId = table.id;
    this.deleteError = null;
    this.cdr.detectChanges();

    this.tableService.delete(table.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.deletingId = null;
          this.tables = this.tables.filter(t => t.id !== table.id);
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Error eliminando mesa:', err);
          this.deleteError = err?.error?.message || 'No se pudo eliminar la mesa.';
          this.deletingId = null;
          this.cdr.detectChanges();
        });
      }
    });
  }

  onSubmit(): void {
    const values = this.form.value;

    if (!values.name) {
      this.saveError = '⚠️ El nombre es obligatorio.';
      return;
    }

    if (!this.isEditing && !this.selectedFile) {
      this.saveError = '⚠️ La imagen es obligatoria.';
      return;
    }

    this.saving = true;
    this.saveError = null;
    this.cdr.detectChanges();

    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      if (this.isRoundShape && (key === 'width' || key === 'depth')) return;
      if (!this.isRoundShape && key === 'diameter') return;

      if (values[key] !== '' && values[key] !== null && values[key] !== undefined) {
        formData.append(key, values[key]);
      }
    });

    formData.append('is_active', 'true');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request$ = this.isEditing
      ? this.tableService.update(this.editingId as number, formData)
      : this.tableService.create(formData);

    request$.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.saving = false;
          this.saveSuccess = true;
          this.loadTables();

          setTimeout(() => {
            this.showForm = false;
            this.resetForm();
            this.saveSuccess = false;
            this.cdr.detectChanges();
          }, 1000);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.saveError = err?.error?.message || (this.isEditing ? '❌ Error actualizando la mesa.' : '❌ Error creando la mesa.');
          this.saving = false;
          this.cdr.detectChanges();
        });
      }
    });
  }
}