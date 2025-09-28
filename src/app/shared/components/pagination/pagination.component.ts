import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <nav aria-label="صفحات النتائج" *ngIf="totalPages > 1">
      <ul class="pagination justify-content-center">
        <!-- First Page -->
        <li class="page-item" [class.disabled]="currentPage === 1">
          <button 
            class="page-link" 
            (click)="goToPage(1)"
            [disabled]="currentPage === 1"
            aria-label="الصفحة الأولى">
            <lucide-icon name="chevrons-left" size="16"></lucide-icon>
          </button>
        </li>

        <!-- Previous Page -->
        <li class="page-item" [class.disabled]="currentPage === 1">
          <button 
            class="page-link" 
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
            aria-label="الصفحة السابقة">
            <lucide-icon name="chevron-left" size="16"></lucide-icon>
          </button>
        </li>

        <!-- Page Numbers -->
        <li 
          class="page-item" 
          *ngFor="let page of visiblePages" 
          [class.active]="page === currentPage">
          <button 
            class="page-link" 
            (click)="goToPage(page)"
            [class.active]="page === currentPage">
            {{ page }}
          </button>
        </li>

        <!-- Next Page -->
        <li class="page-item" [class.disabled]="currentPage === totalPages">
          <button 
            class="page-link" 
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
            aria-label="الصفحة التالية">
            <lucide-icon name="chevron-right" size="16"></lucide-icon>
          </button>
        </li>

        <!-- Last Page -->
        <li class="page-item" [class.disabled]="currentPage === totalPages">
          <button 
            class="page-link" 
            (click)="goToPage(totalPages)"
            [disabled]="currentPage === totalPages"
            aria-label="الصفحة الأخيرة">
            <lucide-icon name="chevrons-right" size="16"></lucide-icon>
          </button>
        </li>
      </ul>

      <!-- Page Info -->
      <div class="pagination-info text-center mt-2">
        <small class="text-muted">
          عرض {{ startItem }} - {{ endItem }} من {{ totalItems }} نتيجة
        </small>
      </div>
    </nav>
  `,
  styles: [`
    .pagination {
      margin: 0;
    }

    .page-link {
      color: #0d6efd;
      background-color: #fff;
      border: 1px solid #dee2e6;
      padding: 0.5rem 0.75rem;
      margin: 0 0.125rem;
      border-radius: 0.375rem;
      transition: all 0.15s ease-in-out;
    }

    .page-link:hover {
      color: #0a58ca;
      background-color: #e9ecef;
      border-color: #dee2e6;
    }

    .page-item.active .page-link {
      color: #fff;
      background-color: #0d6efd;
      border-color: #0d6efd;
    }

    .page-item.disabled .page-link {
      color: #6c757d;
      background-color: #fff;
      border-color: #dee2e6;
      cursor: not-allowed;
    }

    .pagination-info {
      font-size: 0.875rem;
    }

    @media (max-width: 576px) {
      .page-link {
        padding: 0.375rem 0.5rem;
        font-size: 0.875rem;
      }
    }
  `]
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() maxVisiblePages = 5;
  @Output() pageChange = new EventEmitter<number>();

  visiblePages: number[] = [];
  startItem = 0;
  endItem = 0;

  ngOnInit() {
    this.calculateVisiblePages();
    this.calculateItemRange();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentPage'] || changes['totalPages'] || changes['maxVisiblePages']) {
      this.calculateVisiblePages();
    }
    if (changes['currentPage'] || changes['totalItems'] || changes['pageSize']) {
      this.calculateItemRange();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }

  private calculateVisiblePages() {
    const pages: number[] = [];
    const halfVisible = Math.floor(this.maxVisiblePages / 2);
    
    let startPage = Math.max(1, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages, this.currentPage + halfVisible);

    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < this.maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(this.totalPages, startPage + this.maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    this.visiblePages = pages;
  }

  private calculateItemRange() {
    this.startItem = (this.currentPage - 1) * this.pageSize + 1;
    this.endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
}
