import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppNotification } from '../../models/notifications.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private listSubject = new BehaviorSubject<AppNotification[]>([]);
  list$ = this.listSubject.asObservable();

  push(n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const item: AppNotification = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
      ...n
    };
    this.listSubject.next([item, ...this.listSubject.value]);
  }

  markRead(id: string) {
    this.listSubject.next(this.listSubject.value.map(n => n.id === id ? { ...n, read: true } : n));
  }

  clear() {
    this.listSubject.next([]);
  }
}
