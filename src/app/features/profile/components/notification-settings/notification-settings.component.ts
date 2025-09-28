import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, Bell, Mail, Smartphone, Shield } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    LucideAngularModule
  ],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {
  notificationForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      marketingEmails: [false],
      weeklyDigest: [true],
      adUpdates: [true],
      messageNotifications: [true],
      securityAlerts: [true]
    });
  }

  ngOnInit() {}

  onSubmit() {
    this.isSaving = true;
    // Simulate save
    setTimeout(() => {
      this.isSaving = false;
      this.toastr.success('تم حفظ إعدادات الإشعارات', 'تم');
    }, 1000);
  }
}
