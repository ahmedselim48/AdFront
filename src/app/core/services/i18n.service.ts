import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Lang = 'en' | 'ar';

type Dict = Record<string, string>;

const en: Dict = {
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  'nav.ads': 'Ads',
  'nav.smartReplies': 'Smart Replies',
  'nav.competition': 'Competition',
  'nav.reports': 'Reports',
  'nav.admin': 'Admin',
  'nav.profile': 'Profile',

  'hero.headline': 'Create campaigns that convert',
  'hero.sub': 'Design, launch, and optimize ads with confidence. Beautiful analytics, smart automations, and blazing-fast workflows.',
  'hero.ctaPrimary': 'New Campaign',
  'hero.ctaSecondary': 'View Dashboard',

  'home.latestAds': 'Latest Ads',
  'home.noAds': 'No ads yet.',
};

const ar: Dict = {
  'nav.home': 'الرئيسية',
  'nav.dashboard': 'لوحة التحكم',
  'nav.ads': 'الإعلانات',
  'nav.smartReplies': 'الردود الذكية',
  'nav.competition': 'المنافسة',
  'nav.reports': 'التقارير',
  'nav.admin': 'الإدارة',
  'nav.profile': 'الملف الشخصي',

  'hero.headline': 'أنشئ حملات تَحوِّل',
  'hero.sub': 'صمم وأطلق وحسّن إعلاناتك بثقة. تحليلات جميلة، أتمتة ذكية، وتجربة عمل سريعة.',
  'hero.ctaPrimary': 'حملة جديدة',
  'hero.ctaSecondary': 'عرض اللوحة',

  'home.latestAds': 'أحدث الإعلانات',
  'home.noAds': 'لا توجد إعلانات حتى الآن.',
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
    this.doc.documentElement.lang = lang;
    this.doc.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
