import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorageService } from './token-storage.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const storage = inject(TokenStorageService);
  if (storage.accessToken) return true;
  router.navigateByUrl('/auth/login');
  return false;
};
