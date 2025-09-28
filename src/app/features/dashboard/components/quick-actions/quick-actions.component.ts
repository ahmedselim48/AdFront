import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule, Plus, Eye, BarChart3, Settings, MessageSquare, Users, Zap } from 'lucide-angular';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    LucideAngularModule
  ],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent {
  @Output() actionClick = new EventEmitter<string>();

  actions = [
    {
      id: 'create-ad',
      title: 'إنشاء إعلان',
      description: 'أنشئ إعلان جديد',
      icon: 'plus',
      color: 'primary',
      route: '/ads/create'
    },
    {
      id: 'view-ads',
      title: 'عرض الإعلانات',
      description: 'إدارة إعلاناتك',
      icon: 'eye',
      color: 'accent',
      route: '/ads'
    },
    {
      id: 'analytics',
      title: 'التحليلات',
      description: 'إحصائيات مفصلة',
      icon: 'bar-chart-3',
      color: 'warn',
      route: '/analytics'
    },
    {
      id: 'messages',
      title: 'الرسائل',
      description: 'المحادثات',
      icon: 'message-square',
      color: 'primary',
      route: '/messages'
    },
    {
      id: 'ai-tools',
      title: 'أدوات الذكاء الاصطناعي',
      description: 'تحسين الإعلانات',
      icon: 'zap',
      color: 'accent',
      route: '/ai-tools'
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      description: 'إعدادات الحساب',
      icon: 'settings',
      color: 'warn',
      route: '/settings'
    }
  ];

  onActionClick(action: any) {
    this.actionClick.emit(action.id);
  }
}
