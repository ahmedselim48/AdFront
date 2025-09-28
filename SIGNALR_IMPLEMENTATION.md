# SignalR Implementation for Notifications

## نظرة عامة
تم تطبيق SignalR في الفرونت إند لاستقبال الإشعارات في الوقت الفعلي من الباك إند.

## الملفات المضافة/المحدثة

### 1. SignalR Service
**الملف**: `src/app/core/services/signalr.service.ts`

**الوظائف**:
- إدارة الاتصال بـ SignalR Hub
- استقبال الإشعارات في الوقت الفعلي
- إدارة حالة الاتصال وإعادة الاتصال التلقائي
- عرض إشعارات المتصفح
- إدارة مجموعات المستخدمين

### 2. Notification Bell Component
**الملف**: `src/app/shared/components/notification-bell/notification-bell.component.ts`

**الوظائف**:
- عرض جرس الإشعارات مع عداد الإشعارات غير المقروءة
- قائمة منسدلة بالإشعارات الأخيرة
- إمكانية تعيين الإشعارات كمقروءة
- حذف الإشعارات
- تصميم متجاوب

### 3. Header Component
**الملف**: `src/app/shared/components/header/header.component.ts`

**الوظائف**:
- تضمين NotificationBellComponent
- إدارة SignalR connection عند تسجيل الدخول/الخروج

### 4. Dashboard Component
**الملف**: `src/app/features/dashboard/components/dashboard/dashboard.component.ts`

**الوظائف**:
- بدء SignalR connection عند تحميل Dashboard
- الاشتراك في الإشعارات الجديدة
- تحديث قائمة الإشعارات في الوقت الفعلي

## كيفية الاستخدام

### 1. إضافة Notification Bell إلى Header
```html
<app-notification-bell></app-notification-bell>
```

### 2. بدء SignalR Connection في Component
```typescript
import { SignalRService } from '../../../core/services/signalr.service';

export class MyComponent implements OnInit {
  private signalRService = inject(SignalRService);

  ngOnInit() {
    // بدء الاتصال
    this.signalRService.startConnection();
    
    // الاشتراك في الإشعارات
    this.signalRService.notifications$.subscribe(notifications => {
      console.log('New notifications:', notifications);
    });
  }
}
```

### 3. إيقاف SignalR Connection
```typescript
ngOnDestroy() {
  this.signalRService.stopConnection();
}
```

## أنواع الإشعارات المدعومة

### من الباك إند:
- `AdPublished` - تم نشر الإعلان
- `AdExpired` - انتهت مدة الإعلان
- `CompetitionAnalysis` - تحليل المنافسة مكتمل
- `PerformanceImprovement` - تحسن في الأداء
- `SmartRecommendation` - توصية ذكية
- `MarketInsights` - رؤى السوق
- `NewMessage` - رسالة جديدة
- `ContactRequest` - طلب تواصل
- `Security` - تنبيه أمني
- `Payment` - حالة الدفع
- `Subscription` - حالة الاشتراك
- `ABTesting` - نتائج اختبار A/B
- `NewCompetitor` - منافس جديد
- `CheaperCompetitor` - منافس بسعر أقل

## إعدادات SignalR

### Hub URL
```typescript
// في signalr.service.ts
.withUrl(`${environment.apiBaseUrl}/notificationHub`)
```

### Authentication
```typescript
// JWT Token من AuthService
accessTokenFactory: () => {
  return this.authService.accessToken || '';
}
```

### إعادة الاتصال التلقائي
```typescript
.withAutomaticReconnect([0, 2000, 10000, 30000])
```

## Browser Notifications

### طلب الإذن
```typescript
this.signalRService.requestNotificationPermission();
```

### عرض الإشعارات
- يتم عرض إشعارات المتصفح تلقائياً عند استقبال إشعارات جديدة
- يمكن تخصيص الأيقونات والأصوات

## التخصيص

### إضافة أنواع إشعارات جديدة
1. أضف النوع الجديد في `getNotificationIcon()` في `notification-bell.component.ts`
2. أضف معالجة النوع في الباك إند

### تخصيص التصميم
- عدّل الـ styles في `notification-bell.component.ts`
- أضف أيقونات جديدة في `main.ts`

## استكشاف الأخطاء

### مشاكل الاتصال
```typescript
// فحص حالة الاتصال
console.log('Connection state:', this.signalRService.getConnectionState());

// إعادة الاتصال يدوياً
this.signalRService.reconnect();
```

### مشاكل المصادقة
- تأكد من صحة JWT token
- تحقق من إعدادات CORS في الباك إند

### مشاكل الإشعارات
- تحقق من إذن المتصفح للإشعارات
- تأكد من صحة Hub URL

## الأمان

### JWT Authentication
- يتم إرسال JWT token مع كل طلب SignalR
- يتم التحقق من صحة المستخدم في الباك إند

### User Groups
- يتم إضافة المستخدمين لمجموعات مخصصة (`User_{userId}`)
- يتم إرسال الإشعارات للمجموعة المحددة فقط

## الأداء

### إدارة الذاكرة
- يتم إلغاء الاشتراكات في `ngOnDestroy`
- يتم إدارة قائمة الإشعارات بكفاءة

### إعادة الاتصال
- إعادة الاتصال التلقائي مع فترات متدرجة
- معالجة أخطاء الاتصال

## الاختبار

### اختبار الإشعارات
```typescript
// إرسال إشعار تجريبي
this.signalRService.sendCustomNotification(userId, 'Test', 'Test message');
```

### اختبار الاتصال
```typescript
// فحص حالة الاتصال
if (this.signalRService.getConnectionState() === HubConnectionState.Connected) {
  console.log('SignalR is connected');
}
```

## الدعم

للحصول على المساعدة:
1. تحقق من console logs للأخطاء
2. تأكد من تشغيل الباك إند
3. تحقق من إعدادات الشبكة والـ CORS
