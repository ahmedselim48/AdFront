import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
// import { MatChipListboxModule } from '@angular/material/chips'; // Not available in this version
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationSettingsDto } from '../../../models/notification.model';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    // MatChipListboxModule, // Not available in this version
    LucideAngularModule
  ],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup;
  isLoading = false;
  isSaving = false;
  originalSettings: NotificationSettingsDto | null = null;
  
  private destroy$ = new Subject<void>();

  // Time options for quiet hours
  timeOptions = [
    '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
    '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
  ];

  // Frequency options
  frequencyOptions = [
    { value: 'Instant', label: 'فوري' },
    { value: 'Daily', label: 'يومي' },
    { value: 'Weekly', label: 'أسبوعي' },
    { value: 'Monthly', label: 'شهري' }
  ];

  // Time zone options (simplified list)
  timeZoneOptions = [
    { value: 'UTC', label: 'UTC (توقيت عالمي)' },
    { value: 'Asia/Riyadh', label: 'الرياض (GMT+3)' },
    { value: 'Asia/Dubai', label: 'دبي (GMT+4)' },
    { value: 'Asia/Kuwait', label: 'الكويت (GMT+3)' },
    { value: 'Asia/Bahrain', label: 'البحرين (GMT+3)' },
    { value: 'Asia/Qatar', label: 'قطر (GMT+3)' },
    { value: 'Asia/Muscat', label: 'مسقط (GMT+4)' },
    { value: 'Africa/Cairo', label: 'القاهرة (GMT+2)' },
    { value: 'Asia/Beirut', label: 'بيروت (GMT+2)' },
    { value: 'Asia/Amman', label: 'عمان (GMT+2)' }
  ];

  constructor(
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.createSettingsForm();
  }

  ngOnInit(): void {
    this.loadSettings();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createSettingsForm(): FormGroup {
    return this.fb.group({
      // Email Preferences
      emailNotifications: [true],
      emailAdUpdates: [true],
      emailChatMessages: [true],
      emailSystemAlerts: [true],
      emailSecurityAlerts: [true],
      emailPerformanceAlerts: [true],
      emailMarketingEmails: [false],

      // Push Notification Preferences (In-App/Web Push)
      pushNotifications: [true],
      pushAdUpdates: [true],
      pushChatMessages: [true],
      pushSystemAlerts: [true],
      pushSecurityAlerts: [true],
      pushPerformanceAlerts: [true],

      // SMS Preferences (Placeholder - not implemented as per user request)
      smsNotifications: [false],
      smsSecurityAlerts: [false],
      smsPaymentAlerts: [false],

      // Quiet Hours
      enableQuietHours: [false],
      quietHoursStart: ['22:00'],
      quietHoursEnd: ['08:00'],
      timeZone: ['Asia/Riyadh'],

      // Frequency Settings
      emailFrequency: ['Daily'],
      pushFrequency: ['Instant'],

      // Priority Settings
      receiveLowPriority: [true],
      receiveMediumPriority: [true],
      receiveHighPriority: [true],
      receiveUrgentPriority: [true]
    });
  }

  private setupFormSubscriptions(): void {
    // Enable/disable quiet hours fields based on enableQuietHours
    this.settingsForm.get('enableQuietHours')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        const quietHoursStart = this.settingsForm.get('quietHoursStart');
        const quietHoursEnd = this.settingsForm.get('quietHoursEnd');
        
        if (enabled) {
          quietHoursStart?.enable();
          quietHoursEnd?.enable();
        } else {
          quietHoursStart?.disable();
          quietHoursEnd?.disable();
        }
      });

    // Enable/disable email sub-options based on emailNotifications
    this.settingsForm.get('emailNotifications')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        const emailFields = [
          'emailAdUpdates', 'emailChatMessages', 'emailSystemAlerts',
          'emailSecurityAlerts', 'emailPerformanceAlerts', 'emailMarketingEmails'
        ];
        
        emailFields.forEach(field => {
          const control = this.settingsForm.get(field);
          if (enabled) {
            control?.enable();
          } else {
            control?.disable();
          }
        });
      });

    // Enable/disable push sub-options based on pushNotifications
    this.settingsForm.get('pushNotifications')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        const pushFields = [
          'pushAdUpdates', 'pushChatMessages', 'pushSystemAlerts',
          'pushSecurityAlerts', 'pushPerformanceAlerts'
        ];
        
        pushFields.forEach(field => {
          const control = this.settingsForm.get(field);
          if (enabled) {
            control?.enable();
          } else {
            control?.disable();
          }
        });
      });

    // Enable/disable SMS sub-options based on smsNotifications
    this.settingsForm.get('smsNotifications')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(enabled => {
        const smsFields = ['smsSecurityAlerts', 'smsPaymentAlerts'];
        
        smsFields.forEach(field => {
          const control = this.settingsForm.get(field);
          if (enabled) {
            control?.enable();
          } else {
            control?.disable();
          }
        });
      });
  }

  private loadSettings(): void {
    this.isLoading = true;

    this.notificationService.getSettings().subscribe({
      next: (settings) => {
        this.originalSettings = settings;
        this.settingsForm.patchValue(settings);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notification settings:', error);
        this.isLoading = false;
        this.snackBar.open('حدث خطأ في تحميل إعدادات الإشعارات', 'إغلاق', {
          duration: 5000,
          direction: 'rtl'
        });
      }
    });
  }

  /**
   * Save settings
   */
  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.snackBar.open('يرجى مراجعة البيانات المدخلة', 'إغلاق', {
        duration: 3000,
        direction: 'rtl'
      });
      return;
    }

    this.isSaving = true;
    const settings = this.settingsForm.value as NotificationSettingsDto;

    this.notificationService.updateSettings(settings).subscribe({
      next: () => {
        this.isSaving = false;
        this.originalSettings = { ...settings };
        this.snackBar.open('تم حفظ إعدادات الإشعارات بنجاح', 'إغلاق', {
          duration: 3000,
          direction: 'rtl'
        });
      },
      error: (error) => {
        console.error('Error saving notification settings:', error);
        this.isSaving = false;
        this.snackBar.open('حدث خطأ في حفظ إعدادات الإشعارات', 'إغلاق', {
          duration: 5000,
          direction: 'rtl'
        });
      }
    });
  }

  /**
   * Reset settings to original values
   */
  resetSettings(): void {
    if (this.originalSettings) {
      this.settingsForm.patchValue(this.originalSettings);
    }
  }

  /**
   * Check if form has changes
   */
  hasChanges(): boolean {
    if (!this.originalSettings) return false;
    
    const currentValues = this.settingsForm.value;
    return JSON.stringify(currentValues) !== JSON.stringify(this.originalSettings);
  }

  /**
   * Get section description
   */
  getSectionDescription(section: string): string {
    const descriptions: { [key: string]: string } = {
      email: 'تحديد أنواع الإشعارات التي تريد استلامها عبر البريد الإلكتروني',
      push: 'تحديد أنواع الإشعارات التي تريد استلامها كإشعارات فورية في التطبيق',
      sms: 'تحديد أنواع الإشعارات التي تريد استلامها عبر الرسائل النصية (غير متاح حالياً)',
      quiet: 'تحديد أوقات عدم الرغبة في استلام الإشعارات',
      frequency: 'تحديد تكرار استلام الإشعارات',
      priority: 'تحديد أولويات الإشعارات التي تريد استلامها'
    };
    
    return descriptions[section] || '';
  }

  /**
   * Get setting description
   */
  getSettingDescription(setting: string): string {
    const descriptions: { [key: string]: string } = {
      emailNotifications: 'استلام الإشعارات عبر البريد الإلكتروني',
      emailAdUpdates: 'تحديثات الإعلانات',
      emailChatMessages: 'رسائل الدردشة الجديدة',
      emailSystemAlerts: 'تنبيهات النظام',
      emailSecurityAlerts: 'تنبيهات الأمان',
      emailPerformanceAlerts: 'تنبيهات الأداء',
      emailMarketingEmails: 'رسائل التسويق والعروض',
      
      pushNotifications: 'استلام الإشعارات الفورية في التطبيق',
      pushAdUpdates: 'تحديثات الإعلانات',
      pushChatMessages: 'رسائل الدردشة الجديدة',
      pushSystemAlerts: 'تنبيهات النظام',
      pushSecurityAlerts: 'تنبيهات الأمان',
      pushPerformanceAlerts: 'تنبيهات الأداء',
      
      smsNotifications: 'استلام الإشعارات عبر الرسائل النصية (غير متاح حالياً)',
      smsSecurityAlerts: 'تنبيهات الأمان العاجلة',
      smsPaymentAlerts: 'تنبيهات المدفوعات',
      
      enableQuietHours: 'تفعيل أوقات الهدوء',
      quietHoursStart: 'وقت بداية الهدوء',
      quietHoursEnd: 'وقت نهاية الهدوء',
      timeZone: 'المنطقة الزمنية',
      
      emailFrequency: 'تكرار الإشعارات الإلكترونية',
      pushFrequency: 'تكرار الإشعارات الفورية',
      
      receiveLowPriority: 'استلام الإشعارات ذات الأولوية المنخفضة',
      receiveMediumPriority: 'استلام الإشعارات ذات الأولوية المتوسطة',
      receiveHighPriority: 'استلام الإشعارات ذات الأولوية العالية',
      receiveUrgentPriority: 'استلام الإشعارات العاجلة'
    };
    
    return descriptions[setting] || '';
  }

  /**
   * Check if setting is disabled
   */
  isSettingDisabled(setting: string): boolean {
    const control = this.settingsForm.get(setting);
    return control?.disabled || false;
  }

  /**
   * Get quiet hours validation error
   */
  getQuietHoursError(): string | null {
    const start = this.settingsForm.get('quietHoursStart')?.value;
    const end = this.settingsForm.get('quietHoursEnd')?.value;
    
    if (!start || !end) return null;
    
    const startTime = this.timeToMinutes(start);
    const endTime = this.timeToMinutes(end);
    
    if (startTime === endTime) {
      return 'وقت البداية والنهاية لا يمكن أن يكونا متطابقين';
    }
    
    return null;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
