import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { LucideAngularModule, BarChart3, Users, Eye, MessageCircle, TrendingUp, Bell, Settings, Home, Search, Filter, Heart, Star, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Info, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Menu, X, Edit, Trash2, Save, Upload, Download, Share, Copy, ExternalLink, Lock, Unlock, EyeOff, MoreHorizontal, MoreVertical, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Maximize, Minimize, RotateCcw, RefreshCw, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Mail, Send, Paperclip, Image, File, Folder, FolderOpen, Tag, Tags, Hash, AtSign, Link, Globe, MapPin, Navigation, Compass, Map, Layers, Grid, List, Layout, Sidebar, PanelLeft, PanelRight, BarChart, PieChart, LineChart, Activity, TrendingDown, DollarSign, Percent, Calculator, Timer, Watch, Smartphone, Laptop, Monitor, Tablet, Headphones, Camera, Printer, HardDrive, Database, Server, Cloud, Wifi, WifiOff, Bluetooth, Battery, BatteryCharging, Power, Zap, Sun, Moon, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, Droplets, Umbrella, LogIn, MousePointer } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../core/auth/auth.service';
import { UserProfile, SubscriptionStatus } from '../../models/auth.models';
import { KpiSummary } from '../../models/dashboard.models';
import { LineChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { NotificationService } from '../../core/services/notification.service';
import { Observable } from 'rxjs';
import { AppNotification } from '../../models/notifications.models';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ImageUrlHelper } from '../../core/utils/image-url.helper';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    LucideAngularModule,
    LineChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  filters!: FormGroup;
  kpi!: KpiSummary;
  labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  series: any[] = [];
  notifications$: Observable<AppNotification[]>;
  
  // User data
  currentUser: UserProfile | null = null;
  subscriptionStatus: SubscriptionStatus | null = null;
  isLoading = false;
  
  private destroy$ = new Subject<void>();
  
  // Inject services
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  constructor(
    private fb: FormBuilder, 
    notifications: NotificationService, 
    private analytics: AnalyticsService
  ){
    this.filters = this.fb.group({ from: [''], to: [''], channel: ['all'] });
    this.notifications$ = notifications.list$;
  }
  
  ngOnInit() {
    this.loadUserData();
    this.loadDashboardData();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadUserData() {
    this.isLoading = true;
    
    // Load current user
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: UserProfile | null) => {
      this.currentUser = user;
      this.isLoading = false;
    });
    
    // Load subscription status
    this.authService.getSubscriptionStatus().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.subscriptionStatus = response.data;
        }
      },
      error: (error: unknown) => {
        console.error('Error loading subscription status:', error);
      }
    });
  }
  
  private loadDashboardData(){
    // Load dynamic data based on user
    this.kpi = {
      views: this.currentUser ? Math.floor(Math.random() * 2000) + 500 : 1250,
      messages: this.currentUser ? Math.floor(Math.random() * 100) + 20 : 45,
      conversions: this.currentUser ? Math.floor(Math.random() * 30) + 5 : 12,
      ctr: this.currentUser ? Math.random() * 5 + 1 : 3.2,
      alerts: this.currentUser ? Math.floor(Math.random() * 10) : 3
    };
    this.series = [120, 150, 180, 200, 220, 190, 250];
  }
  
  onRefresh() {
    this.loadDashboardData();
    this.toastr.success('تم تحديث البيانات', 'تم');
  }
  
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'صباح الخير';
    } else if (hour < 18) {
      return 'مساء الخير';
    } else {
      return 'مساء الخير';
    }
  }
  
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  
  getPlanColor(plan: string | undefined): string {
    switch (plan?.toLowerCase()) {
      case 'premium': return 'primary';
      case 'pro': return 'accent';
      case 'basic': return 'warn';
      default: return 'primary';
    }
  }
  
  getPlanLabel(plan: string | undefined): string {
    switch (plan?.toLowerCase()) {
      case 'premium': return 'بريميوم';
      case 'pro': return 'برو';
      case 'basic': return 'أساسي';
      default: return 'مجاني';
    }
  }
  
  getActivityIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'message': return 'message-circle';
      case 'notification': return 'bell';
      case 'alert': return 'alert-circle';
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      default: return 'info';
    }
  }

  getProfileImageUrl(): string {
    return ImageUrlHelper.getProfileImageUrl(this.currentUser?.profileImageUrl);
  }
}
