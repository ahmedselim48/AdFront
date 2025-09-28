import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Services
import { AuthService } from './auth/auth.service';
import { TokenStorageService } from './auth/token-storage.service';
import { ApiClientService } from './services/api-client.service';
import { ThemeService } from './services/theme.service';
import { I18nService } from './services/i18n.service';
import { SignalRService } from './services/signalr.service';

// Guards
import { AuthGuard, GuestGuard } from './auth/auth.guard';
import { adminGuard } from './auth/admin.guard';

// Interceptors
import { jwtInterceptor } from './auth/jwt.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { tenantInterceptor } from './interceptors/tenant.interceptor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [
    // Services
    AuthService,
    TokenStorageService,
    ApiClientService,
    ThemeService,
    I18nService,
    SignalRService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
