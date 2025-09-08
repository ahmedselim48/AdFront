import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdsService } from '../ads/ads.service';
import { AdItem } from '../../models/ads.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="home-wrap">
    <h2>Latest Ads</h2>
    <div class="ads-grid">
      <article class="ad-card" *ngFor="let ad of ads">
        <header class="ad-head">
          <h3>{{ad.name}}</h3>
          <span class="status" [attr.data-status]="ad.status">{{ad.status}}</span>
        </header>
        <div class="ad-body">
          <ng-container *ngIf="ad.variants && ad.variants.length; else noVar">
            <div class="variant" *ngFor="let v of ad.variants">
              <h4>{{v.title}}</h4>
              <p>{{v.body}}</p>
            </div>
          </ng-container>
          <ng-template #noVar><p>No variants</p></ng-template>
        </div>
      </article>
    </div>
    <p class="empty" *ngIf="!ads.length">لا توجد إعلانات حتى الآن.</p>
  </section>
  `,
  styles: [`.home-wrap{max-width:1024px;margin:auto;display:block}
  .ads-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
  .ad-card{border:1px solid #e5e7eb;border-radius:.5rem;padding:.75rem;background:#fff}
  .ad-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
  .status{font-size:.75rem;border:1px solid #e5e7eb;border-radius:9999px;padding:.125rem .5rem;text-transform:capitalize}
  .ad-body .variant{border:1px dashed #e5e7eb;border-radius:.5rem;padding:.5rem;margin-bottom:.5rem}
  @media(max-width:900px){.ads-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.ads-grid{grid-template-columns:1fr}}`]
})
export class HomeComponent {
  ads: AdItem[] = [];
  constructor(private adsService: AdsService){
    this.adsService.list().subscribe({ next: (list)=> this.ads = list, error: ()=> this.ads = [] });
  }
}
