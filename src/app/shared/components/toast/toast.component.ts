import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { AppNotification } from '../../../models/notifications.models';

@Component({
  selector: 'app-toast-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnDestroy {
  items: AppNotification[] = [];
  private sub?: Subscription;

  constructor(private notifications: NotificationService) {
    this.sub = this.notifications.list$.subscribe(list => {
      this.items = list.slice(0, 4);
      if (this.items.length) timer(5000).subscribe(() => this.dismiss(this.items[0].id));
    });
  }

  dismiss(id: string) {
    this.notifications.markRead(id);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
