import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableService } from '../../service/table.service';
import { TableItem } from '../../models/table.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  tables: TableItem[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private tableService: TableService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Home iniciado');
    this.loading = true;

    this.tableService.getAll().subscribe({
      next: (response: any) => {
        console.log('Datos recibidos:', response);
        const data = response?.data ?? response;
        this.tables = Array.isArray(data) ? data.slice(0, 6) : [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error home:', err);
        this.error = 'No se pudo cargar el catálogo.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getImageUrl(path: string): string {
    if (!path) return 'assets/placeholder.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:5000/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  }

  goToUpload(): void {
    this.router.navigateByUrl('/mi-sala');
  }

  getTilt(index: number): string {
    return index % 2 === 0 ? '-1.5deg' : '1.5deg';
  }
}