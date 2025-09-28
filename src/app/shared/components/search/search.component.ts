import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, X } from 'lucide-angular';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="search-container">
      <div class="search-input-group">
        <div class="input-group">
          <span class="input-group-text">
            <lucide-icon name="search" size="18"></lucide-icon>
          </span>
          <input
            type="text"
            class="form-control"
            [placeholder]="placeholder"
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            (keyup.enter)="onSearch()"
            [disabled]="loading">
          <button
            *ngIf="searchTerm"
            class="btn btn-outline-secondary"
            type="button"
            (click)="clearSearch()"
            [disabled]="loading">
            <lucide-icon name="x" size="16"></lucide-icon>
          </button>
          <button
            class="btn btn-primary"
            type="button"
            (click)="onSearch()"
            [disabled]="loading">
            <span *ngIf="!loading">بحث</span>
            <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">جاري البحث...</span>
            </span>
          </button>
        </div>
      </div>

      <!-- Advanced Search Toggle -->
      <div class="advanced-search-toggle" *ngIf="showAdvancedToggle">
        <button
          class="btn btn-link btn-sm"
          type="button"
          (click)="toggleAdvancedSearch()">
          <lucide-icon name="filter" size="16"></lucide-icon>
          {{ showAdvanced ? 'إخفاء البحث المتقدم' : 'البحث المتقدم' }}
        </button>
      </div>

      <!-- Advanced Search Form -->
      <div class="advanced-search" *ngIf="showAdvanced && showAdvancedToggle">
        <div class="row g-3">
          <div class="col-md-4" *ngIf="showCategoryFilter">
            <label class="form-label">الفئة</label>
            <select class="form-select" [(ngModel)]="filters.categoryId" (change)="onFilterChange()">
              <option value="">جميع الفئات</option>
              <option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="col-md-4" *ngIf="showPriceFilter">
            <label class="form-label">السعر</label>
            <div class="row g-2">
              <div class="col-6">
                <input
                  type="number"
                  class="form-control"
                  placeholder="من"
                  [(ngModel)]="filters.minPrice"
                  (change)="onFilterChange()">
              </div>
              <div class="col-6">
                <input
                  type="number"
                  class="form-control"
                  placeholder="إلى"
                  [(ngModel)]="filters.maxPrice"
                  (change)="onFilterChange()">
              </div>
            </div>
          </div>

          <div class="col-md-4" *ngIf="showLocationFilter">
            <label class="form-label">الموقع</label>
            <input
              type="text"
              class="form-control"
              placeholder="أدخل الموقع"
              [(ngModel)]="filters.location"
              (change)="onFilterChange()">
          </div>

          <div class="col-md-4" *ngIf="showStatusFilter">
            <label class="form-label">الحالة</label>
            <select class="form-select" [(ngModel)]="filters.status" (change)="onFilterChange()">
              <option value="">جميع الحالات</option>
              <option *ngFor="let status of statusOptions" [value]="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>

          <div class="col-md-4" *ngIf="showSortFilter">
            <label class="form-label">ترتيب حسب</label>
            <select class="form-select" [(ngModel)]="filters.sortBy" (change)="onFilterChange()">
              <option *ngFor="let sort of sortOptions" [value]="sort.value">
                {{ sort.label }}
              </option>
            </select>
          </div>

          <div class="col-12">
            <div class="d-flex gap-2">
              <button
                class="btn btn-primary"
                type="button"
                (click)="applyFilters()"
                [disabled]="loading">
                تطبيق الفلاتر
              </button>
              <button
                class="btn btn-outline-secondary"
                type="button"
                (click)="clearFilters()"
                [disabled]="loading">
                مسح الفلاتر
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      margin-bottom: 1.5rem;
    }

    .search-input-group {
      margin-bottom: 1rem;
    }

    .input-group-text {
      background-color: #f8f9fa;
      border-color: #ced4da;
    }

    .advanced-search-toggle {
      text-align: center;
      margin-bottom: 1rem;
    }

    .advanced-search {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      padding: 1.5rem;
      margin-top: 1rem;
    }

    .form-label {
      font-weight: 500;
      color: #495057;
      margin-bottom: 0.5rem;
    }

    .btn-link {
      color: #0d6efd;
      text-decoration: none;
    }

    .btn-link:hover {
      color: #0a58ca;
      text-decoration: underline;
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }

    @media (max-width: 768px) {
      .advanced-search {
        padding: 1rem;
      }
    }
  `]
})
export class SearchComponent implements OnInit {
  @Input() placeholder = 'البحث...';
  @Input() loading = false;
  @Input() showAdvancedToggle = true;
  @Input() showCategoryFilter = false;
  @Input() showPriceFilter = false;
  @Input() showLocationFilter = false;
  @Input() showStatusFilter = false;
  @Input() showSortFilter = false;
  @Input() categories: any[] = [];
  @Input() statusOptions: { value: string; label: string }[] = [];
  @Input() sortOptions: { value: string; label: string }[] = [
    { value: 'createdAt', label: 'تاريخ الإنشاء' },
    { value: 'price', label: 'السعر' },
    { value: 'title', label: 'العنوان' },
    { value: 'viewsCount', label: 'عدد المشاهدات' }
  ];

  @Output() search = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() advancedSearch = new EventEmitter<any>();

  searchTerm = '';
  showAdvanced = false;

  filters = {
    categoryId: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    location: '',
    status: '',
    sortBy: 'createdAt'
  };

  ngOnInit() {
    // Initialize with default sort option
    this.filters.sortBy = this.sortOptions[0]?.value || 'createdAt';
  }

  onSearchChange() {
    // Emit search term as user types (with debounce if needed)
    this.search.emit(this.searchTerm);
  }

  onSearch() {
    this.search.emit(this.searchTerm);
  }

  onFilterChange() {
    this.filterChange.emit(this.filters);
  }

  clearSearch() {
    this.searchTerm = '';
    this.search.emit('');
  }

  toggleAdvancedSearch() {
    this.showAdvanced = !this.showAdvanced;
  }

  applyFilters() {
    this.advancedSearch.emit({
      searchTerm: this.searchTerm,
      filters: this.filters
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.filters = {
      categoryId: '',
      minPrice: null,
      maxPrice: null,
      location: '',
      status: '',
      sortBy: this.sortOptions[0]?.value || 'createdAt'
    };
    this.advancedSearch.emit({
      searchTerm: '',
      filters: this.filters
    });
  }
}
