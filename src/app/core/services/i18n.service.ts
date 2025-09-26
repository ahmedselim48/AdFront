import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Lang = 'en' | 'ar';

type Dict = Record<string, string>;

const en: Dict = {
  'site.title': 'Haraj Plus',
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  'nav.ads': 'Ads',
  'nav.smartReplies': 'Smart Replies',
  'nav.competition': 'Competition',
  'nav.reports': 'Reports',
  'nav.admin': 'Admin',
  'nav.profile': 'Profile',
  'nav.chat': 'Chat',
  'nav.directChat': 'Direct Chat',

  'hero.headline': 'Create campaigns that convert',
  'hero.sub': 'Design, launch, and optimize ads with confidence. Beautiful analytics, smart automations, and blazing-fast workflows.',
  'hero.ctaPrimary': 'New Campaign',
  'hero.ctaSecondary': 'View Dashboard',

  'home.latestAds': 'Latest Ads',
  'home.noAds': 'No ads yet.',

  'common.name': 'Name',
  'common.title': 'Title',
  'common.email': 'Email',
  'common.password': 'Password',
  'common.active': 'Active',
  'common.save': 'Save',
  'common.remove': 'Remove',
  'common.details': 'Details',
  'common.actions': 'Actions',
  'common.all': 'All',
  'common.from': 'From',
  'common.to': 'To',

  'status.draft': 'Draft',
  'status.scheduled': 'Scheduled',
  'status.active': 'Active',
  'status.paused': 'Paused',

  'ads.createTitle': 'Create Ad',
  'ads.status': 'Status',
  'ads.scheduleAt': 'Schedule at',
  'ads.variants': 'Variants (A/B)',
  'ads.addVariant': 'Add Variant',
  'ads.body': 'Body',
  "ads.title": "Title",
  "ads.titlePlaceholder": "Enter ad title",
  "ads.titleRequired": "Title is required",

  "ads.description": "Description",
  "ads.descriptionPlaceholder": "Enter description",
  "ads.descriptionRequired": "Description is required",

  "ads.price": "Price",
  "ads.pricePlaceholder": "Enter price",
  "ads.priceInvalid": "Price must be valid",

  "ads.location": "Location",
  "ads.locationPlaceholder": "Enter location",
  "ads.locationRequired": "Location is required",

  "ads.upload": "Upload Images",
  "ads.uploading": "Uploading...",
  "ads.create": "Create Ad",
  "ads.analyze": "Analyze Images",
  "ads.analyzing": "Analyzing...",
  "ads.error": "An error occurred while creating the ad. Please try again.",
  'ads.fillWithAI': 'Fill with AI',

  'admin.title': 'Admin Panel',
  'admin.users': 'Users',
  'admin.tenants': 'Tenants',
  'admin.tenantName': 'Tenant Name',
  'admin.addTenant': 'Add Tenant',

  'dash.allChannels': 'All Channels',
  'dash.facebook': 'Facebook',
  'dash.google': 'Google',
  'dash.views': 'Views',
  'dash.messages': 'Messages',
  'dash.conversions': 'Conversions',
  'dash.ctr': 'CTR',
  'dash.alerts': 'Alerts',
  'dash.performance': 'Performance',
  'dash.chartsHere': 'Charts appear here',

  'comp.title': 'Competition Analysis',
  'comp.keyword': 'Keyword',
  'comp.competitor': 'Competitor',
  'comp.adCount': 'Ad Count',
  'comp.avgCtr': 'Avg CTR',

  'reports.title': 'Reports',
  'reports.type': 'Type',
  'reports.generate': 'Generate',
  'reports.schedule': 'Schedule',
  'reports.cronPlaceholder': 'Cron e.g. 0 0 * * *',

  'profile.title': 'Profile',
  'profile.plan': 'Plan',
  'plan.free': 'Free',
  'plan.pro': 'Pro',
  'plan.enterprise': 'Enterprise',

  'smart.title': 'Smart Replies',
  'smart.messagePlaceholder': 'Customer message...',
  'smart.generate': 'Generate',
  'smart.suggested': 'Suggested Reply',
  'smart.templates': 'Templates',

  'chat.title': 'Conversations',
  'chat.directChat': 'Direct Chat',
  'chat.thread': 'Conversation',
  'chat.typeMessage': 'Type a message…',
  'chat.send': 'Send',
  'chat.templates': 'Reply Templates',
  'chat.conversation': 'Conversation',

  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.logout': 'Logout',
  'auth.rememberMe': 'Remember Me',
  'auth.userName': 'Username',
  'auth.fullName': 'Full Name',
  'auth.confirmPassword': 'Confirm Password',
  'auth.resendConfirmation': 'Resend Confirmation',
  'auth.changePassword': 'Change Password',
  'auth.currentPassword': 'Current Password',
  'auth.newPassword': 'New Password',
  'auth.backToLogin': 'Back to Login',
  'auth.backToProfile': 'Back to Profile',
  'auth.userNameRequired': 'Username is required',
  'auth.fullNameRequired': 'Full name is required',
  'auth.emailInvalid': 'Please enter a valid email',
  'auth.passwordMinLength': 'Password must be at least 6 characters',
  'auth.passwordsDoNotMatch': 'Passwords do not match',
  'auth.currentPasswordRequired': 'Current password is required',
  'auth.createAccount': 'Create account',
  'auth.already': 'Already have an account?',
  'auth.forgot': 'Forgot password?',
  'auth.sendReset': 'Send reset link',
  'auth.reset': 'Reset Password',

  'notifications.title': 'Notifications',
};

const ar: Dict = {
 'site.title':  'حراج بلس',
  'nav.home':"الرئيسية",
  'nav.dashboard': 'لوحة التحكم',
  'nav.ads': 'الإعلانات',
  'nav.smartReplies': 'الردود الذكية',
  'nav.competition': 'المنافسة',
  'nav.reports': 'التقارير',
  'nav.admin': 'الإدارة',
  'nav.profile': 'الملف الشخصي',
  'nav.chat': 'الدردشة',

  'hero.headline': 'أنشئ حملات تَحوِّل',
  'hero.sub': 'صمم وأطلق وحسّن إعلاناتك بثقة. تحليلات جميلة، أتمتة ذكية، وتجربة عمل سريعة.',
  'hero.ctaPrimary': 'حملة جديدة',
  'hero.ctaSecondary': 'عرض اللوحة',

  'home.latestAds': 'أحدث الإعلانات',
  'home.noAds': 'لا توجد إعلانات حتى الآن.',

  'common.name': 'الاسم',
  'common.title': 'العنوان',
  'common.email': 'البريد الإلكتروني',
  'common.password': 'كلمة المرور',
  'common.active': 'مفعل',
  'common.save': 'حفظ',
  'common.remove': 'حذف',
  'common.details': 'تفاصيل',
  'common.actions': 'إجراءات',
  'common.all': 'الكل',
  'common.from': 'من',
  'common.to': 'إلى',

  'status.draft': 'مسودة',
  'status.scheduled': 'مجدول',
  'status.active': 'نشط',
  'status.paused': 'متوقف مؤقتاً',

  'ads.createTitle': 'إنشاء إعلان',
  'ads.status': 'الحالة',
  'ads.scheduleAt': 'الجدولة في',
  'ads.variants': 'النسخ (A/B)',
  'ads.addVariant': 'إضافة نسخة',
  'ads.body': 'النص',
     "ads.title": "العنوان",
  "ads.titlePlaceholder": "أدخل عنوان الإعلان",
  "ads.titleRequired": "العنوان مطلوب",

  "ads.description": "الوصف",
  "ads.descriptionPlaceholder": "أدخل الوصف",
  "ads.descriptionRequired": "الوصف مطلوب",
  'ads.fillWithAI': 'املأ بالذكاء الاصطناعي',

  "ads.price": "السعر",
  "ads.pricePlaceholder": "أدخل السعر",
  "ads.priceInvalid": "يجب إدخال سعر صحيح",

  "ads.location": "الموقع",
  "ads.locationPlaceholder": "أدخل الموقع",
  "ads.locationRequired": "الموقع مطلوب",

  "ads.upload": "رفع الصور",
  "ads.uploading": "جاري الرفع...",
  "ads.create": "إنشاء إعلان",
  "ads.analyze": "تحليل الصور",
  "ads.analyzing": "جاري التحليل...",
  "ads.error": "حدث خطأ أثناء إنشاء الإعلان. حاول مرة أخرى.",
  'admin.title': 'لوحة الإدارة',
  'admin.users': 'المستخدمون',
  'admin.tenants': 'المستأجرون',
  'admin.tenantName': 'اسم المستأجر',
  'admin.addTenant': 'إضافة مستأجر',

  'dash.allChannels': 'كل القنوات',
  'dash.facebook': 'فيسبوك',
  'dash.google': 'جوجل',
  'dash.views': 'المشاهدات',
  'dash.messages': 'الرسائل',
  'dash.conversions': 'التحويلات',
  'dash.ctr': 'نسبة النقر',
  'dash.alerts': 'التنبيهات',
  'dash.performance': 'الأداء',
  'dash.chartsHere': 'ستظهر الرسوم البيانية هنا',

  'comp.title': 'تحليل المنافسة',
  'comp.keyword': 'كلمة مفتاحية',
  'comp.competitor': 'المنافس',
  'comp.adCount': 'عدد الإعلانات',
  'comp.avgCtr': 'متوسط CTR',

  'reports.title': 'التقارير',
  'reports.type': 'النوع',
  'reports.generate': 'توليد',
  'reports.schedule': 'جدولة',
  'reports.cronPlaceholder': 'صيغة كرون مثال 0 0 * * *',

  'profile.title': 'الملف الشخصي',
  'profile.plan': 'الباقة',
  'plan.free': 'مجان��',
  'plan.pro': 'احترافي',
  'plan.enterprise': 'شركات',

  'smart.title': 'الردود الذكية',
  'smart.messagePlaceholder': 'رسالة العميل...',
  'smart.generate': 'توليد',
  'smart.suggested': 'الرد المقترح',
  'smart.templates': 'القوالب',

  'chat.title': 'المحادثات',
  'chat.thread': 'محادثة',
  'chat.typeMessage': 'اكتب رسالة…',
  'chat.send': 'إرسال',
  'chat.templates': 'قوالب الرد',
  'chat.conversation': 'محادثة',

  'auth.login': 'تسجيل الدخول',
  'auth.register': 'إنشاء حساب',
  'auth.logout': 'تسجيل الخروج',
  'auth.rememberMe': 'تذكرني',
  'auth.userName': 'اسم المستخدم',
  'auth.fullName': 'الاسم الكامل',
  'auth.confirmPassword': 'تأكيد كلمة المرور',
  'auth.resendConfirmation': 'إعادة إرسال التأكيد',
  'auth.changePassword': 'تغيير كلمة المرور',
  'auth.currentPassword': 'كلمة المرور الحالية',
  'auth.newPassword': 'كلمة المرور الجديدة',
  'auth.backToLogin': 'العودة لتسجيل الدخول',
  'auth.backToProfile': 'العودة للملف الشخصي',
  'auth.userNameRequired': 'اسم المستخدم مطلوب',
  'auth.fullNameRequired': 'الاسم الكامل مطلوب',
  'auth.emailInvalid': 'يرجى إدخال بريد إلكتروني صحيح',
  'auth.passwordMinLength': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  'auth.passwordsDoNotMatch': 'كلمات المرور غير متطابقة',
  'auth.currentPasswordRequired': 'كلمة المرور الحالية مطلوبة',
  'auth.createAccount': 'إنشاء حساب',
  'auth.already': 'هل لديك حساب بالفعل؟',
  'auth.forgot': 'نسيت كلمة المرور؟',
  'auth.sendReset': 'إرسال رابط الاستعادة',
  'auth.reset': 'إعادة تعيين كلمة المرور',

  'notifications.title': 'الإشعارات',
};

const DICTS: Record<Lang, Dict> = { en, ar };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private langSubject = new BehaviorSubject<Lang>(this.readInitial());
  lang$ = this.langSubject.asObservable();

  constructor(@Inject(DOCUMENT) private doc: Document) {
    this.applyToDocument(this.langSubject.value);
  }

  get current(): Lang { return this.langSubject.value; }

  setLanguage(lang: Lang): void {
    if (lang === this.langSubject.value) return;
    this.langSubject.next(lang);
    localStorage.setItem('lang', lang);
    this.applyToDocument(lang);
  }

  toggle(): void {
    this.setLanguage(this.current === 'en' ? 'ar' : 'en');
  }

  t(key: string): string {
    const l = this.langSubject.value;
    return DICTS[l][key] ?? DICTS.en[key] ?? key;
  }

  private readInitial(): Lang {
    const saved = (localStorage.getItem('lang') as Lang | null) ?? 'en';
    return saved === 'ar' ? 'ar' : 'en';
  }

  private applyToDocument(lang: Lang): void {
    this.doc.documentElement.lang = lang === 'ar' ? 'ar-SA' : 'en';
    this.doc.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
