import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ApiClientService } from '../services/api-client.service';
import { of } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

class ApiMock {
  post$(){ return of({ accessToken: 'a', refreshToken: 'r', expiresIn: 3600 }); }
  get$(){ return of({ id: '1', email: 'e@e.com', name: 'n', role: 'user' }); }
}

describe('AuthService', () => {
  let service: AuthService; let storage: TokenStorageService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), AuthService, TokenStorageService, { provide: ApiClientService, useClass: ApiMock }] });
    service = TestBed.inject(AuthService);
    storage = TestBed.inject(TokenStorageService);
  });

  it('sets tokens after login', (done) => {
    service.login({ email: 'a', password: 'b' }).subscribe(() => {
      expect(storage.accessToken).toBe('a');
      expect(storage.refreshToken).toBe('r');
      done();
    });
  });
});
