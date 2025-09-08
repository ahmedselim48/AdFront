import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserProfile } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AppStoreService {
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  user$ = this.userSubject.asObservable();

  setUser(u: UserProfile | null) {
    this.userSubject.next(u);
  }
}
