import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, HelpCircle, BookOpen, MessageCircle, Mail, Phone, ExternalLink } from 'lucide-angular';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule,
    LucideAngularModule
  ],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {
  // FAQ data
  faqItems = [
    {
      question: 'كيف يمكنني إنشاء إعلان جديد؟',
      answer: 'يمكنك إنشاء إعلان جديد من خلال الضغط على زر "إعلان جديد" في لوحة التحكم، ثم اتباع الخطوات المطلوبة لإدخال المعلومات والصور.'
    },
    {
      question: 'ما هي أنواع الإعلانات المتاحة؟',
      answer: 'نحن نقدم أنواع مختلفة من الإعلانات مثل السيارات، العقارات، الأجهزة الإلكترونية، والخدمات.'
    },
    {
      question: 'كيف يمكنني التواصل مع البائعين؟',
      answer: 'يمكنك التواصل مع البائعين من خلال نظام الرسائل المدمج في المنصة أو من خلال المعلومات المرفقة في الإعلان.'
    },
    {
      question: 'ما هي رسوم النشر؟',
      answer: 'نحن نقدم خيارات نشر مجانية ومدفوعة. الإعلانات المجانية لها حدود معينة، بينما الإعلانات المدفوعة تحصل على ميزات إضافية.'
    }
  ];

  // Contact information
  contactInfo = {
    email: 'support@harajplus.com',
    phone: '+966 50 123 4567',
    workingHours: 'الأحد - الخميس: 9:00 ص - 6:00 م'
  };

  // Help sections
  helpSections = [
    {
      title: 'الدليل الشامل',
      description: 'تعلم كيفية استخدام المنصة بفعالية',
      icon: 'book-open',
      link: '/guide'
    },
    {
      title: 'الدعم الفني',
      description: 'احصل على مساعدة فورية من فريق الدعم',
      icon: 'message-circle',
      link: '/support'
    },
    {
      title: 'التواصل معنا',
      description: 'تواصل معنا مباشرة للحصول على المساعدة',
      icon: 'mail',
      link: '/contact'
    }
  ];

  ngOnInit() {
    // Component initialization
  }

  openExternalLink(url: string) {
    window.open(url, '_blank');
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // You can add a toast notification here
      console.log('تم نسخ النص إلى الحافظة');
    });
  }
}
