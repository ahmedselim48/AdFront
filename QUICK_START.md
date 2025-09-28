# دليل البدء السريع - Account Integration

## 1. إعداد البيئة

### تأكد من تشغيل Backend
```bash
# في مجلد HarajAI
dotnet run --project HarajAI.WebAPI
```

### تشغيل Angular Frontend
```bash
# في مجلد Front/AdFront
npm install
ng serve
```

## 2. إعداد Google Sign-In

### 1. إنشاء Google OAuth Client
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل Google+ API
4. أنشئ OAuth 2.0 Client ID
5. أضف `http://localhost:4200` إلى Authorized JavaScript origins

### 2. تحديث Client ID
```typescript
// في src/app/core/services/google-auth.service.ts
private readonly GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID_HERE';
```

### 3. إضافة Google Script
```html
<!-- في src/index.html -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

## 3. اختبار الوظائف

### تسجيل الدخول العادي
1. اذهب إلى `/auth/login`
2. أدخل البريد الإلكتروني وكلمة المرور
3. اختر "تذكرني" إذا أردت

### التسجيل
1. اذهب إلى `/auth/register`
2. املأ جميع الحقول المطلوبة
3. تأكد من قوة كلمة المرور

### تسجيل الدخول عبر Google
1. اذهب إلى `/auth/login`
2. اضغط على زر "Sign in with Google"
3. اختر حساب Google

### إدارة الملف الشخصي
1. بعد تسجيل الدخول، اذهب إلى `/profile`
2. عدّل البيانات الشخصية
3. ارفع صورة شخصية

## 4. استكشاف الأخطاء

### مشاكل شائعة

#### Google Sign-In لا يعمل
- تأكد من صحة Client ID
- تأكد من إضافة localhost:4200 إلى Authorized origins
- تحقق من console للأخطاء

#### Backend غير متاح
- تأكد من تشغيل HarajAI.WebAPI
- تحقق من أن المنفذ 5254 مفتوح
- تحقق من logs في Backend

#### مشاكل في الصور
- تأكد من أن Backend يدعم رفع الملفات
- تحقق من حجم الصورة (أقل من 5MB)
- تأكد من نوع الملف (JPG, PNG, etc.)

## 5. APIs المتاحة

### Account APIs
```
POST /api/Account/register
POST /api/Account/login
POST /api/Account/google-login
POST /api/Account/logout
POST /api/Account/forgot-password
POST /api/Account/reset-password
POST /api/Account/change-password
POST /api/Account/resend-confirmation
POST /api/Account/confirm-email
GET  /api/Account/profile
PUT  /api/Account/profile
GET  /api/Account/subscription-status
```

### استخدام APIs في الكود
```typescript
// مثال: تسجيل الدخول
this.authService.login({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true
}).subscribe({
  next: (response) => {
    console.log('تم تسجيل الدخول:', response.user);
  },
  error: (error) => {
    console.error('خطأ في تسجيل الدخول:', error);
  }
});
```

## 6. التخصيص

### تغيير الألوان
```scss
// في styles.scss
:root {
  --brand: #0066ff;
  --accent: #22c55e;
  --danger: #ef4444;
  --text: #1f2937;
  --muted: #6b7280;
}
```

### إضافة حقول جديدة
```typescript
// في auth.models.ts
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  // أضف حقول جديدة هنا
  address?: string;
  dateOfBirth?: string;
}
```

## 7. النشر

### إعداد Production
```typescript
// في environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://your-api-domain.com/api',
  openAiProxyUrl: 'https://your-api-domain.com/ai'
};
```

### تحديث Google OAuth
- أضف domain الإنتاج إلى Authorized origins
- حدث Client ID في GoogleAuthService

## 8. الدعم

للحصول على المساعدة:
1. تحقق من console للأخطاء
2. راجع logs في Backend
3. تأكد من صحة البيانات المرسلة
4. تحقق من اتصال الشبكة

---

**ملاحظة**: تأكد من قراءة `ACCOUNT_INTEGRATION_README.md` للحصول على تفاصيل أكثر شمولية.
