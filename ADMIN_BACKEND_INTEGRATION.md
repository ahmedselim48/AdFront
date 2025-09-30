# دليل تكامل لوحة الإدارة مع الباك إند

## نظرة عامة

تم إنشاء نظام لوحة إدارة متكامل يستهلك APIs من الباك إند ASP.NET Core. النظام يدعم:

- **إدارة المستخدمين**: عرض، حذف، حظر، وإلغاء حظر المستخدمين
- **إدارة الإعلانات**: مراجعة، قبول، رفض، وحذف الإعلانات
- **إدارة الفئات**: إضافة، تعديل، وحذف الفئات
- **الإحصائيات والتقارير**: عرض البيانات الإحصائية وتصدير التقارير

## الخدمات المُنشأة

### 1. AdminService (`src/app/core/services/admin.service.ts`)

خدمة رئيسية لإدارة المستخدمين والإعلانات:

```typescript
// إدارة المستخدمين
getUsers(page, pageSize, searchTerm): Observable<GeneralResponse<PaginatedUsersResponse>>
deleteUser(userId): Observable<GeneralResponse<any>>
banUser7Days(userId, reason): Observable<GeneralResponse<any>>
banUserPermanent(userId, reason): Observable<GeneralResponse<any>>
unbanUser(userId): Observable<GeneralResponse<any>>

// إدارة الإعلانات
getAds(page, pageSize, searchTerm, status): Observable<GeneralResponse<PaginatedAdsResponse>>
getAdById(adId): Observable<GeneralResponse<AdminAdDto>>
acceptAd(adId): Observable<GeneralResponse<any>>
rejectAd(adId, reason): Observable<GeneralResponse<any>>
deleteAd(adId): Observable<GeneralResponse<any>>

// الإحصائيات والتقارير
getStatistics(): Observable<GeneralResponse<AdminStatisticsDto>>
getWeeklyReport(): Observable<GeneralResponse<AdminReportDto>>
getMonthlyReport(): Observable<GeneralResponse<AdminReportDto>>
exportWeeklyReport(format): Observable<Blob>
exportMonthlyReport(format): Observable<Blob>
```

### 2. StatisticsService (`src/app/core/services/statistics.service.ts`)

خدمة متخصصة للإحصائيات والتقارير:

```typescript
getStatistics(): Observable<GeneralResponse<AdminStatisticsDto>>
getDashboardStats(): Observable<GeneralResponse<DashboardStatsDto>>
getWeeklyReport(): Observable<GeneralResponse<AdminReportDto>>
getMonthlyReport(): Observable<GeneralResponse<AdminReportDto>>
exportWeeklyReport(format): Observable<Blob>
exportMonthlyReport(format): Observable<Blob>
getCategoryAnalytics(): Observable<GeneralResponse<any>>
```

### 3. CategoryManagementService (`src/app/core/services/category-management.service.ts`)

خدمة متخصصة لإدارة الفئات:

```typescript
getAllCategories(): Observable<GeneralResponse<CategoryDto[]>>
createCategory(category): Observable<GeneralResponse<CategoryDto>>
updateCategory(id, category): Observable<GeneralResponse<CategoryDto>>
deleteCategory(id): Observable<GeneralResponse<any>>
getCategoryById(id): Observable<GeneralResponse<CategoryDto>>
```

## نماذج البيانات (Data Models)

### AdminUserDto
```typescript
interface AdminUserDto {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  emailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  status: string; // "Active" or "Blocked"
  blockExpiryDate?: string;
  blockReason?: string;
}
```

### AdminAdDto
```typescript
interface AdminAdDto {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: string; // "Pending", "Approved", "Rejected"
  userId: string;
  ownerUserName: string;
  ownerEmail: string;
  createdAt: string;
  rejectionReason?: string;
}
```

### AdminStatisticsDto
```typescript
interface AdminStatisticsDto {
  totalUsers: number;
  totalSubscriptions: number;
  monthlyEarnings: { [key: string]: number };
  totalEarnings: number;
  totalAds: number;
  totalRejectedAds: number;
  totalAcceptedAds: number;
}
```

## نقاط النهاية (API Endpoints)

### إدارة المستخدمين
- `GET /admin/users` - الحصول على قائمة المستخدمين مع pagination
- `DELETE /admin/users/{userId}` - حذف مستخدم
- `PUT /admin/users/{userId}/ban/7days` - حظر مستخدم لمدة 7 أيام
- `PUT /admin/users/{userId}/ban/permanent` - حظر مستخدم نهائياً
- `PUT /admin/users/{userId}/unban` - إلغاء حظر مستخدم

### إدارة الإعلانات
- `GET /admin/ads` - الحصول على قائمة الإعلانات مع pagination
- `GET /admin/ads/{adId}` - الحصول على إعلان محدد
- `PUT /admin/ads/{adId}/accept` - قبول إعلان
- `PUT /admin/ads/{adId}/reject` - رفض إعلان
- `DELETE /admin/ads/{adId}` - حذف إعلان

### إدارة الفئات
- `GET /api/Categories` - الحصول على جميع الفئات
- `POST /api/Categories` - إنشاء فئة جديدة
- `PUT /api/Categories/{id}` - تحديث فئة
- `DELETE /api/Categories/{id}` - حذف فئة

### الإحصائيات والتقارير
- `GET /admin/statistics` - الحصول على الإحصائيات العامة
- `GET /admin/dashboard/stats` - إحصائيات لوحة التحكم
- `GET /admin/reports/weekly` - التقرير الأسبوعي
- `GET /admin/reports/monthly` - التقرير الشهري
- `GET /admin/reports/weekly/export` - تصدير التقرير الأسبوعي
- `GET /admin/reports/monthly/export` - تصدير التقرير الشهري

## المكونات المُحدثة

### 1. AdminDashboardComponent
- يستخدم `StatisticsService` للحصول على الإحصائيات
- يستخدم `CategoryManagementService` للحصول على بيانات الفئات
- يعرض البيانات في لوحة تحكم تفاعلية

### 2. UserManagementComponent
- يستخدم `AdminService` لإدارة المستخدمين
- يدعم البحث والتصفية والترقيم
- يوفر عمليات الحذف والحظر

### 3. AdManagementComponent
- يستخدم `AdminService` لإدارة الإعلانات
- يدعم مراجعة الإعلانات (قبول/رفض)
- يوفر تصفية حسب الحالة

### 4. CategoryManagementComponent
- يستخدم `CategoryManagementService` لإدارة الفئات
- يدعم عمليات CRUD كاملة
- يوفر واجهة شجرية للفئات

### 5. ReportsComponent
- يستخدم `StatisticsService` لعرض التقارير
- يدعم تصدير التقارير بصيغ مختلفة
- يعرض المخططات والرسوم البيانية

## إعداد البيئة

### ملفات البيئة
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5254',
  apiBaseUrl: 'http://localhost:5254/api',
  openAiProxyUrl: 'http://localhost:5254/ai'
};
```

### المصادقة (Authentication)
جميع endpoints تتطلب مصادقة Admin:
```csharp
[Authorize(Roles = "Admin")]
```

## الاستخدام

### 1. في المكونات
```typescript
constructor(
  private adminService: AdminService,
  private statisticsService: StatisticsService,
  private categoryService: CategoryManagementService
) {}

// مثال: الحصول على المستخدمين
loadUsers() {
  this.adminService.getUsers(1, 20, 'search term')
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data?.users || [];
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
}
```

### 2. معالجة الأخطاء
```typescript
this.adminService.deleteUser(userId)
  .subscribe({
    next: (response) => {
      if (response.success) {
        this.snackBar.open('تم حذف المستخدم بنجاح', 'إغلاق', { duration: 3000 });
      } else {
        this.snackBar.open(response.message, 'إغلاق', { duration: 3000 });
      }
    },
    error: (error) => {
      this.snackBar.open('حدث خطأ في حذف المستخدم', 'إغلاق', { duration: 3000 });
    }
  });
```

## الميزات المتقدمة

### 1. Pagination
جميع قوائم البيانات تدعم الترقيم:
```typescript
interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### 2. البحث والتصفية
```typescript
// البحث في المستخدمين
getUsers(page: number, pageSize: number, searchTerm?: string)

// التصفية في الإعلانات
getAds(page: number, pageSize: number, searchTerm?: string, status?: string)
```

### 3. تصدير التقارير
```typescript
// تصدير التقرير الأسبوعي
this.statisticsService.exportWeeklyReport('pdf')
  .subscribe(blob => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'weekly-report.pdf';
    link.click();
  });
```

## الأمان

- جميع العمليات تتطلب صلاحيات Admin
- استخدام JWT للتوكن
- التحقق من صحة البيانات في الفرونت والباك
- معالجة شاملة للأخطاء

## التطوير المستقبلي

1. **إضافة المزيد من الإحصائيات**: مخططات تفاعلية، تحليلات متقدمة
2. **نظام الإشعارات**: إشعارات فورية للمديرين
3. **سجل العمليات**: تتبع جميع العمليات الإدارية
4. **أدوات التحليل**: تحليل سلوك المستخدمين والأداء
5. **تصدير متقدم**: تصدير البيانات بصيغ مختلفة (Excel, CSV, JSON)

## استكشاف الأخطاء

### مشاكل شائعة
1. **خطأ 401 Unauthorized**: تأكد من وجود توكن صالح وصلاحيات Admin
2. **خطأ 404 Not Found**: تأكد من صحة رابط API
3. **خطأ 500 Internal Server Error**: تحقق من سجلات الباك إند

### نصائح التطوير
1. استخدم Developer Tools لمراقبة طلبات الشبكة
2. تحقق من console للأخطاء
3. استخدم Angular DevTools للتطوير
4. اختبر APIs مباشرة باستخدام Postman أو Swagger

---

هذا الدليل يوضح كيفية استخدام نظام لوحة الإدارة المتكامل مع الباك إند. جميع الخدمات جاهزة للاستخدام وتدعم العمليات الكاملة لإدارة النظام.
