// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { AppComponent } from './app/app.component';
// import { registerLocaleData } from '@angular/common';
// import localeArSa from '@angular/common/locales/ar-SA';

// registerLocaleData(localeArSa);

// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeArSa from '@angular/common/locales/ar-SA';
import { LucideAngularModule, MessageCircle, User, Plus } from 'lucide-angular';
import { importProvidersFrom } from '@angular/core';
import { appConfig } from './app/app.config';

registerLocaleData(localeArSa);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(
      LucideAngularModule.pick({ MessageCircle, User, Plus })
    )
  ]
}).catch(err => console.error(err));
