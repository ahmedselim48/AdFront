# Account Integration - HarajAI Backend

تم تحديث مشروع Angular لاستهلاك جميع APIs الخاصة بـ Account من HarajAI Backend.

## التحديثات المنجزة

### 1. تحديث النماذج (Models)
تم تحديث `src/app/models/auth.models.ts` لتتماشى مع Backend DTOs:

#### نماذج الطلبات (Request Models):
- `LoginRequest` - تسجيل الدخول
- `RegisterRequest` - التسجيل (مع firstName, lastName, phoneNumber)
- `ForgotPasswordRequest` - نسيان كلمة المرور
- `ResetPasswordRequest` - إعادة تعيين كلمة المرور
- `ChangePasswordRequest` - تغيير كلمة المرور
- `ResendConfirmationRequest` - إعادة إرسال تأكيد البريد
- `ConfirmEmailRequest` - تأكيد البريد الإلكتروني
- `UpdateProfileRequest` - تحديث الملف الشخصي
- `GoogleLoginRequest` - تسجيل الدخول عبر Google

#### نماذج الاستجابات (Response Models):
- `AuthResponse` - استجابة المصادقة
- `SocialLoginResponse` - استجابة تسجيل الدخول الاجتماعي
- `UserProfile` - بيانات المستخدم
- `EmailConfirmationResponse` - استجابة تأكيد البريد
- `SubscriptionStatus` - حالة الاشتراك

### 2. تحديث AuthService
تم تحديث `src/app/core/auth/auth.service.ts` لاستهلاك جميع APIs:

#### طرق المصادقة:
- `login()` - تسجيل الدخول
- `register()` - التسجيل العادي
- `registerWithoutEmail()` - التسجيل بدون بريد إلكتروني
- `googleLogin()` - تسجيل الدخول عبر Google
- `logout()` - تسجيل الخروج

#### طرق إدارة كلمة المرور:
- `forgotPassword()` - نسيان كلمة المرور
- `resetPassword()` - إعادة تعيين كلمة المرور
- `changePassword()` - تغيير كلمة المرور

#### طرق تأكيد البريد:
- `resendConfirmation()` - إعادة إرسال تأكيد البريد
- `confirmEmail()` - تأكيد البريد الإلكتروني

#### طرق إدارة الملف الشخصي:
- `getProfile()` - الحصول على الملف الشخصي
- `updateProfile()` - تحديث الملف الشخصي
- `getSubscriptionStatus()` - الحصول على حالة الاشتراك

### 3. خدمات جديدة

#### ProfileService
`src/app/core/services/profile.service.ts` - خدمة إدارة الملف الشخصي:
- `getProfile()` - الحصول على الملف الشخصي
- `updateProfile()` - تحديث الملف الشخصي
- `getSubscriptionStatus()` - حالة الاشتراك
- `uploadProfileImage()` - رفع صورة الملف الشخصي
- `deleteProfileImage()` - حذف صورة الملف الشخصي

#### GoogleAuthService
`src/app/core/services/google-auth.service.ts` - خدمة Google Sign-In:
- `renderButton()` - عرض زر Google Sign-In
- `getGoogleIdToken()` - الحصول على Google ID Token
- `createGoogleLoginRequest()` - إنشاء طلب تسجيل الدخول
- `signOut()` - تسجيل الخروج من Google

### 4. مكونات محدثة

#### RegisterComponent
تم تحديث `src/app/features/auth/register.component.ts`:
- إضافة حقول firstName, lastName, phoneNumber
- تحديث التحقق من صحة البيانات
- تحديث HTML template مع تخطيط محسن
- إضافة CSS للـ name-row

#### LoginComponent
تم تحديث `src/app/features/auth/login.component.ts`:
- إضافة دعم Google Login
- إضافة divider بين طرق تسجيل الدخول
- تحديث CSS للـ divider

#### GoogleLoginComponent
مكون جديد `src/app/features/auth/google-login.component.ts`:
- تكامل مع Google Sign-In API
- معالجة استجابة Google
- واجهة مستخدم محسنة

#### ProfileManagementComponent
مكون جديد `src/app/features/profile/profile-management.component.ts`:
- عرض وتحديث بيانات الملف الشخصي
- رفع وحذف صورة الملف الشخصي
- عرض حالة الحساب والاشتراك
- واجهة مستخدم شاملة ومتجاوبة

### 5. APIs المستهلكة

جميع APIs التالية من HarajAI Backend:

#### Account Controller:
- `POST /api/Account/register` - التسجيل
- `POST /api/Account/register-without-email` - التسجيل بدون بريد
- `POST /api/Account/login` - تسجيل الدخول
- `POST /api/Account/google-login` - تسجيل الدخول عبر Google
- `POST /api/Account/logout` - تسجيل الخروج
- `POST /api/Account/forgot-password` - نسيان كلمة المرور
- `POST /api/Account/reset-password` - إعادة تعيين كلمة المرور
- `POST /api/Account/change-password` - تغيير كلمة المرور
- `POST /api/Account/resend-confirmation` - إعادة إرسال التأكيد
- `POST /api/Account/confirm-email` - تأكيد البريد الإلكتروني
- `GET /api/Account/profile` - الحصول على الملف الشخصي
- `PUT /api/Account/profile` - تحديث الملف الشخصي
- `GET /api/Account/subscription-status` - حالة الاشتراك

## كيفية الاستخدام

### 1. إعداد Google Sign-In
```typescript
// في google-auth.service.ts
private readonly GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
```

### 2. استخدام AuthService
```typescript
// تسجيل الدخول
this.authService.login({ email, password, rememberMe }).subscribe({
  next: (response) => {
    // تم تسجيل الدخول بنجاح
    console.log('User:', response.user);
  },
  error: (error) => {
    // معالجة الخطأ
  }
});

// التسجيل
this.authService.register({
  userName, firstName, lastName, email, phoneNumber, password
}).subscribe({
  next: (response) => {
    // تم التسجيل بنجاح
  }
});
```

### 3. استخدام ProfileService
```typescript
// تحديث الملف الشخصي
this.profileService.updateProfile({
  firstName, lastName, phoneNumber
}).subscribe({
  next: (profile) => {
    // تم التحديث بنجاح
  }
});
```

## الميزات الجديدة

1. **تسجيل الدخول عبر Google** - تكامل كامل مع Google Sign-In
2. **إدارة الملف الشخصي** - واجهة شاملة لإدارة البيانات الشخصية
3. **رفع الصور** - إمكانية رفع وحذف صورة الملف الشخصي
4. **حالة الاشتراك** - عرض حالة الاشتراك الحالية
5. **تحقق محسن** - تحقق من صحة البيانات مع رسائل خطأ باللغة العربية
6. **واجهة متجاوبة** - تصميم متجاوب يعمل على جميع الأجهزة

## ملاحظات مهمة

1. تأكد من تحديث `GOOGLE_CLIENT_ID` في `GoogleAuthService`
2. تأكد من أن Backend يعمل على `http://localhost:5254`
3. جميع الرسائل والواجهات باللغة العربية
4. تم الحفاظ على التوافق مع الكود الموجود (Legacy Support)

## الملفات المحدثة

- `src/app/models/auth.models.ts`
- `src/app/core/auth/auth.service.ts`
- `src/app/features/auth/register.component.ts`
- `src/app/features/auth/register.component.html`
- `src/app/features/auth/register.component.scss`
- `src/app/features/auth/login.component.ts`
- `src/app/features/auth/login.component.html`
- `src/app/features/auth/login.component.scss`

## الملفات الجديدة

- `src/app/core/services/profile.service.ts`
- `src/app/core/services/google-auth.service.ts`
- `src/app/features/auth/google-login.component.ts`
- `src/app/features/profile/profile-management.component.ts`
- `ACCOUNT_INTEGRATION_README.md`
