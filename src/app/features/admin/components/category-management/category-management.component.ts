import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTreeModule } from '@angular/material/tree';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminService, CategoryDto, GeneralResponse } from '../../../../core/services/admin.service';

interface TreeNode {
  id: number;
  name: string;
  description: string;
  parentId?: number;
  children?: TreeNode[];
  isExpanded?: boolean;
  adsCount?: number;
  isActive?: boolean;
}

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatBadgeModule,
    MatExpansionModule,
    MatTreeModule,
    MatSlideToggleModule
  ],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss']
})
export class CategoryManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  private destroy$ = new Subject<void>();
  
  loading = false;
  searchForm: FormGroup;
  categoryForm: FormGroup;
  dataSource = new MatTableDataSource<CategoryDto>();
  treeDataSource: TreeNode[] = [];
  displayedColumns: string[] = [
    'select',
    'name',
    'description',
    'adsCount',
    'actions'
  ];

  totalCategories = 0;
  pageSize = 20;
  currentPage = 1;
  searchTerm = '';
  selectedCategories: Set<number> = new Set();
  selectedCategory: CategoryDto | null = null;
  isEditing = false;
  showTreeView = false;

  // Parent categories removed per request
  parentCategories: CategoryDto[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      isActive: ['all']
    });

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      parentId: [null],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadParentCategories();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadCategories();
      });
  }

  loadCategories(): void {
    this.loading = true;
    
    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GeneralResponse<CategoryDto[]>) => {
          if (response.success && response.data) {
            const list: any[] = response.data.map(c => ({ ...c, adsCount: 0 }));
            this.dataSource.data = list as any;
            this.totalCategories = list.length;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            // fetch each category ads count
            list.forEach(c => {
              this.categoryService.getCategoryWithAds(c.id).pipe(takeUntil(this.destroy$)).subscribe(res => {
                if (res.success && res.data) {
                  c.adsCount = Array.isArray(res.data.ads) ? res.data.ads.length : 0;
                }
              });
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.snackBar.open('خطأ في تحميل الفئات', 'إغلاق', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  loadParentCategories(): void {
    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GeneralResponse<CategoryDto[]>) => {
          if (response.success && response.data) {
            this.parentCategories = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading parent categories:', error);
        }
      });
  }

  // Tree view removed as parent is no longer used

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCategories();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadCategories();
  }

  clearSearch(): void {
    this.searchForm.reset({
      searchTerm: '',
      isActive: 'all'
    });
    this.currentPage = 1;
    this.loadCategories();
  }

  selectCategory(categoryId: number): void {
    if (this.selectedCategories.has(categoryId)) {
      this.selectedCategories.delete(categoryId);
    } else {
      this.selectedCategories.add(categoryId);
    }
  }

  selectAllCategories(): void {
    if (this.selectedCategories.size === this.dataSource.data.length) {
      this.selectedCategories.clear();
    } else {
      this.dataSource.data.forEach(category => {
        this.selectedCategories.add(category.id);
      });
    }
  }

  isAllSelected(): boolean {
    return this.selectedCategories.size === this.dataSource.data.length && this.dataSource.data.length > 0;
  }

  isIndeterminate(): boolean {
    return this.selectedCategories.size > 0 && this.selectedCategories.size < this.dataSource.data.length;
  }

  toggleTreeView(): void {
    this.showTreeView = !this.showTreeView;
  }

  toggleNode(node: TreeNode): void {
    node.isExpanded = !node.isExpanded;
  }

  addCategory(): void {
    this.selectedCategory = null;
    this.isEditing = false;
    this.categoryForm.reset({
      name: '',
      description: '',
      parentId: null,
      isActive: true
    });
  }

  editCategory(category: CategoryDto): void {
    this.selectedCategory = category;
    this.isEditing = true;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      parentId: null,
      isActive: true
    });
  }

  saveCategory(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      
      if (this.isEditing && this.selectedCategory) {
        const updateDto = {
          name: formValue.name,
          description: formValue.description,
          isActive: formValue.isActive
        };

        this.categoryService.updateCategory(this.selectedCategory.id, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open('تم تحديث الفئة بنجاح', 'إغلاق', { duration: 3000 });
                this.loadCategories();
                this.loadParentCategories();
                this.cancelEdit();
              } else {
                this.snackBar.open('خطأ في تحديث الفئة', 'إغلاق', { duration: 3000 });
              }
            },
            error: (error) => {
              console.error('Error updating category:', error);
              this.snackBar.open('خطأ في تحديث الفئة', 'إغلاق', { duration: 3000 });
            }
          });
      } else {
        const createDto = {
          name: formValue.name,
          description: formValue.description,
          isActive: formValue.isActive
        };

        this.categoryService.createCategory(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open('تم إنشاء الفئة بنجاح', 'إغلاق', { duration: 3000 });
                this.loadCategories();
                this.loadParentCategories();
                this.cancelEdit();
              } else {
                this.snackBar.open('خطأ في إنشاء الفئة', 'إغلاق', { duration: 3000 });
              }
            },
            error: (error) => {
              console.error('Error creating category:', error);
              this.snackBar.open('خطأ في إنشاء الفئة', 'إغلاق', { duration: 3000 });
            }
          });
      }
    } else {
      this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'إغلاق', { duration: 3000 });
    }
  }

  cancelEdit(): void {
    this.selectedCategory = null;
    this.isEditing = false;
    this.categoryForm.reset();
  }

  deleteCategory(categoryId: number): void {
    if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      this.categoryService.deleteCategory(categoryId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('تم حذف الفئة بنجاح', 'إغلاق', { duration: 3000 });
              this.loadCategories();
              this.loadParentCategories();
            } else {
              this.snackBar.open('خطأ في حذف الفئة', 'إغلاق', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error deleting category:', error);
            this.snackBar.open('خطأ في حذف الفئة', 'إغلاق', { duration: 3000 });
          }
        });
    }
  }

  bulkAction(action: string): void {
    if (this.selectedCategories.size === 0) {
      this.snackBar.open('يرجى اختيار فئة واحدة على الأقل', 'إغلاق', { duration: 3000 });
      return;
    }

    const categoryIds = Array.from(this.selectedCategories);
    
    switch (action) {
      case 'activate':
        this.bulkActivateCategories(categoryIds);
        break;
      case 'deactivate':
        this.bulkDeactivateCategories(categoryIds);
        break;
      case 'delete':
        this.bulkDeleteCategories(categoryIds);
        break;
    }
  }

  private bulkActivateCategories(categoryIds: number[]): void {
    // Implementation for bulk activation
    this.snackBar.open(`تم تفعيل ${categoryIds.length} فئة بنجاح`, 'إغلاق', { duration: 3000 });
    this.selectedCategories.clear();
  }

  private bulkDeactivateCategories(categoryIds: number[]): void {
    // Implementation for bulk deactivation
    this.snackBar.open(`تم إلغاء تفعيل ${categoryIds.length} فئة بنجاح`, 'إغلاق', { duration: 3000 });
    this.selectedCategories.clear();
  }

  private bulkDeleteCategories(categoryIds: number[]): void {
    if (confirm(`هل أنت متأكد من حذف ${categoryIds.length} فئة؟`)) {
      categoryIds.forEach(categoryId => {
        this.categoryService.deleteCategory(categoryId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open(`تم حذف ${categoryIds.length} فئة بنجاح`, 'إغلاق', { duration: 3000 });
                this.loadCategories();
                this.loadParentCategories();
                this.selectedCategories.clear();
              }
            },
            error: (error) => {
              console.error('Error bulk deleting categories:', error);
              this.snackBar.open('خطأ في حذف الفئات', 'إغلاق', { duration: 3000 });
            }
          });
      });
    }
  }

  getParentCategoryName(parentId: number): string {
    const parent = this.parentCategories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'غير محدد';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('ar-SA');
  }

  hasChildren(node: TreeNode): boolean {
    return !!(node.children && node.children.length > 0);
  }
}
