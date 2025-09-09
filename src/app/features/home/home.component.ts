import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdsService } from '../ads/ads.service';
import { AdItem } from '../../models/ads.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  ads: AdItem[] = [];
  loading = true;
  skeletons = Array.from({ length: 6 });
  constructor(private adsService: AdsService){
    this.adsService.list().subscribe({
      next: (list)=> { this.ads = list; this.loading = false; },
      error: ()=> { this.ads = []; this.loading = false; }
    });
  }
}
