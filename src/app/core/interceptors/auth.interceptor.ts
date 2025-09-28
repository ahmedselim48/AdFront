import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to requests
    const authToken = this.authService.accessToken;
    
    if (authToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid
          this.authService.logoutLocal();
          this.router.navigate(['/auth/login']);
          this.toastr.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى', 'انتهت الجلسة');
        } else if (error.status === 403) {
          // Forbidden
          this.toastr.error('ليس لديك صلاحية للوصول إلى هذا المورد', 'غير مصرح');
        } else if (error.status === 500) {
          // Server error
          this.toastr.error('حدث خطأ في الخادم، يرجى المحاولة لاحقاً', 'خطأ في الخادم');
        } else if (error.status === 0) {
          // Network error
          this.toastr.error('تحقق من اتصال الإنترنت', 'خطأ في الشبكة');
        }

        return throwError(() => error);
      })
    );
  }
}
