import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  return auth.loadProfile().pipe(
    map(u => {
      if (u.role === 'admin') return true;
      router.navigateByUrl('/');
      return false;
    })
  );
};
