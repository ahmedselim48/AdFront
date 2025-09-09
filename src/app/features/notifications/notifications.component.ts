import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { I18nService } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  constructor(public notifications: NotificationService, private i18n: I18nService){}
  get locale(){ return this.i18n.current === 'ar' ? 'ar-SA' : 'en-US'; }
}
