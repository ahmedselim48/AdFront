import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section>
    <h2>Notifications</h2>
    <ul class="list">
      <li *ngFor="let n of (notifications.list$ | async)">
        <span class="badge" [class.info]="n.level==='info'" [class.warning]="n.level==='warning'" [class.error]="n.level==='error'" [class.success]="n.level==='success'"></span>
        <span class="msg">{{n.message}}</span>
        <small>{{n.createdAt | date:'short'}}</small>
      </li>
    </ul>
  </section>
  `,
  styles: [`.list{list-style:none;padding:0;display:flex;flex-direction:column;gap:.5rem}
  li{display:flex;align-items:center;gap:.5rem;border:1px solid #e5e7eb;border-radius:.5rem;padding:.5rem}
  .badge{width:.75rem;height:.75rem;border-radius:9999px;background:#9ca3af;display:inline-block}
  .badge.info{background:#2b6cb0}.badge.warning{background:#d69e2e}.badge.error{background:#c53030}.badge.success{background:#2f855a}
  .msg{flex:1}`]
})
export class NotificationsComponent {
  constructor(public notifications: NotificationService){}
}
