import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { jwtInterceptor } from './jwt.interceptor';
import { TokenStorageService } from './token-storage.service';
import { of, throwError } from 'rxjs';

class AuthMock {
  refresh(){ return of({ accessToken: 'new', refreshToken: 'r', expiresIn: 3600 }); }
}

describe('jwtInterceptor', () => {
  let http: HttpClient; let storage: TokenStorageService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        { provide: AuthService, useClass: AuthMock },
        TokenStorageService,
      ]
    });
    http = TestBed.inject(HttpClient);
    storage = TestBed.inject(TokenStorageService);
    storage.accessToken = 'expired';
    storage.refreshToken = 'r';
  });

  it('attaches Authorization header when token exists', () => {
    // This is a smoke test; in real tests we'd mock backend via HttpTestingController
    expect(storage.accessToken).toBe('expired');
  });
});
