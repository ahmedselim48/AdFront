import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile } from '../../models/auth.models';
import { AdsService } from '../ads/ads.service';
import { AdItem } from '../../models/ads.models';
import { ChatService } from '../../core/services/chat.service';
import { Conversation } from '../../models/chat.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  ads: AdItem[] = [];
  loadingAds = true;
  loadingChats = true;
  saving = false;
  viewMode: 'grid' | 'list' = 'grid';
  filter: 'all' | 'draft' | 'scheduled' | 'active' | 'paused' | 'published' = 'all';
  activeTab: 'profile' | 'ads' | 'chat' = 'profile';
  recentChats: Conversation[] = [];
  unreadMessages = 0;
  private VIEW_KEY = 'profile_view_mode';
  private FILTER_KEY = 'profile_ads_filter';
  private TAB_KEY = 'profile_active_tab';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private adsSvc: AdsService, 
    private chatSvc: ChatService,
    private router: Router
  ){
    this.form = this.fb.group({ 
      id: [''], 
      email: [''], 
      name: ['', [Validators.required, this.nameValidator]], 
      plan: ['free', Validators.required] 
    });
    
    // restore persisted UI state
    this.viewMode = (localStorage.getItem(this.VIEW_KEY) as 'grid'|'list') ?? 'grid';
    this.filter = (localStorage.getItem(this.FILTER_KEY) as typeof this.filter) ?? 'all';
    this.activeTab = (localStorage.getItem(this.TAB_KEY) as typeof this.activeTab) ?? 'profile';
  }

  ngOnInit() {
    this.loadProfile();
    this.loadAds();
    this.loadChats();
    this.loadUnreadCount();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  // Load methods
  private loadProfile() {
    const sub = this.auth.loadProfile().subscribe((u: UserProfile) => {
      this.form.patchValue(u);
    });
    this.subscriptions.push(sub);
  }

  private loadAds() {
    const sub = this.adsSvc.list().subscribe({ 
      next: list => { 
        this.ads = list; 
        this.loadingAds = false; 
      }, 
      error: () => { 
        this.loadingAds = false; 
      } 
    });
    this.subscriptions.push(sub);
  }

  private loadChats() {
    const sub = this.chatSvc.listConversations().subscribe({
      next: conversations => {
        this.recentChats = conversations.slice(0, 5); // Show only recent 5 chats
        this.loadingChats = false;
      },
      error: () => {
        this.loadingChats = false;
      }
    });
    this.subscriptions.push(sub);
  }

  private loadUnreadCount() {
    const sub = this.chatSvc.unreadCount().subscribe({
      next: result => {
        this.unreadMessages = result.count;
      },
      error: () => {
        this.unreadMessages = 0;
      }
    });
    this.subscriptions.push(sub);
  }

  // Form validation
  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    if (value.length < 2) return { minLength: true };
    if (value.length > 50) return { maxLength: true };
    return null;
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'name':
        if (errors['required']) return 'الاسم مطلوب';
        if (errors['minLength']) return 'الاسم يجب أن يكون حرفين على الأقل';
        if (errors['maxLength']) return 'الاسم يجب أن يكون أقل من 50 حرف';
        break;
    }

    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  hasFieldSuccess(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    if (!field || !field.touched || !field.value) return false;
    
    if (fieldName === 'name') {
      return field.value.length >= 2 && field.value.length <= 50 && !field.errors && field.dirty;
    }
    
    return !field.errors && field.value.length > 0 && field.dirty;
  }

  // Save profile
  save(){ 
    if(this.form.invalid) return;
    this.saving = true;
    const formData = this.form.value;
    console.log('Saving profile:', formData);
    // TODO: Implement profile update API call
    setTimeout(() => {
      this.saving = false;
    }, 1000);
  }

  // Tab management
  setActiveTab(tab: 'profile' | 'ads' | 'chat') {
    this.activeTab = tab;
    localStorage.setItem(this.TAB_KEY, tab);
  }

  // Ads management
  get filteredAds(): AdItem[] {
    if(this.filter === 'all') return this.ads;
    // map 'published' to 'active' for now
    const status = this.filter === 'published' ? 'active' : this.filter;
    return this.ads.filter(a => a.status === status);
  }

  setView(mode: 'grid'|'list'){ 
    this.viewMode = mode; 
    localStorage.setItem(this.VIEW_KEY, mode); 
  }
  
  setFilter(f: 'all'|'draft'|'scheduled'|'active'|'paused'|'published'){ 
    this.filter = f; 
    localStorage.setItem(this.FILTER_KEY, f); 
  }

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

  get totalAds(): number {
    return this.ads.length;
  }

  get activeAds(): number {
    return this.ads.filter(ad => ad.status === 'active').length;
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
   goToAddAd() {
    this.router.navigate(['/adscreate']); // هتروح على كومبوننت إضافة إعلان
  }
}
