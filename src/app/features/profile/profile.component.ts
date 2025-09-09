import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile } from '../../models/auth.models';
import { AdsService } from '../ads/ads.service';
import { AdItem } from '../../models/ads.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  form!: FormGroup;
  ads: AdItem[] = [];
  loadingAds = true;
  viewMode: 'grid' | 'list' = 'grid';
  filter: 'all' | 'draft' | 'scheduled' | 'active' | 'paused' | 'published' = 'all';
  private VIEW_KEY = 'profile_view_mode';
  private FILTER_KEY = 'profile_ads_filter';
  constructor(private fb: FormBuilder, private auth: AuthService, private adsSvc: AdsService, private router: Router){
    this.form = this.fb.group({ id: [''], email: [''], name: ['', Validators.required], plan: ['free', Validators.required] });
    this.auth.loadProfile().subscribe((u: UserProfile)=> this.form.patchValue(u));
    // restore persisted UI state
    this.viewMode = (localStorage.getItem(this.VIEW_KEY) as 'grid'|'list') ?? 'grid';
    this.filter = (localStorage.getItem(this.FILTER_KEY) as typeof this.filter) ?? 'all';
    this.adsSvc.list().subscribe({ next: list => { this.ads = list; this.loadingAds = false; }, error: () => { this.loadingAds = false; } });
  }
  save(){ }

  get filteredAds(): AdItem[] {
    if(this.filter === 'all') return this.ads;
    // map 'published' to 'active' for now
    const status = this.filter === 'published' ? 'active' : this.filter;
    return this.ads.filter(a => a.status === status);
  }

  setView(mode: 'grid'|'list'){ this.viewMode = mode; localStorage.setItem(this.VIEW_KEY, mode); }
  setFilter(f: 'all'|'draft'|'scheduled'|'active'|'paused'|'published'){ this.filter = f; localStorage.setItem(this.FILTER_KEY, f); }

  get counts(){
    const c: Record<string, number> = { all: this.ads.length, draft: 0, scheduled: 0, active: 0, paused: 0, published: 0 };
    for(const a of this.ads){
      if(a.status === 'draft') c['draft']++;
      else if(a.status === 'scheduled') c['scheduled']++;
      else if(a.status === 'active') { c['active']++; c['published']++; }
      else if(a.status === 'paused') c['paused']++;
    }
    return c;
  }

  editAd(ad: AdItem){
    localStorage.setItem('edit_ad', JSON.stringify(ad));
    this.router.navigate(['/ads']);
  }

  deleteAd(ad: AdItem){
    if(!confirm('Delete this ad?')) return;
    this.adsSvc.remove(ad.id).subscribe({
      next: () => { this.ads = this.ads.filter(a => a.id !== ad.id); },
      error: () => {}
    });
  }
}
