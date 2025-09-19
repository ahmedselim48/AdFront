import { Component, OnInit } from '@angular/core';
import { AdsService } from '../../core/services/ads.service';
import { AdDto } from '../../models/ads.models';

@Component({
  selector: 'app-ads-list',
  imports: [],
  templateUrl: './ads-list.component.html',
  styleUrl: './ads-list.component.scss'
})
export class AdsListComponent implements OnInit {
  ads: AdDto[] = [];
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 0;
  loading = false;
  error = '';

  constructor(private adsService: AdsService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.adsService.getAll(this.page, this.pageSize).subscribe({
      next: res => {
        this.loading = false;
        this.ads = res.data;
        if (res.meta) {
          this.total = res.meta.totalCount;
          this.page = res.meta.currentPage;
          this.pageSize = res.meta.pageSize;
          this.totalPages = res.meta.totalPages;
        }
      },
      error: err => {
        this.loading = false;
        this.error = err?.message ?? 'Error loading ads';
      }
    });
  }

  next() {
    if (this.page < this.totalPages) {
      this.page++;
      this.load();
    }
  }

  prev() {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }
}