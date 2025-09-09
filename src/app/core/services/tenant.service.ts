import { Injectable } from '@angular/core';

const TENANT_KEY = 'tenant_id';

@Injectable({ providedIn: 'root' })
export class TenantService {
  get tenantId(): string | null {
    return localStorage.getItem(TENANT_KEY);
  }

  set tenantId(value: string | null) {
    if (value) localStorage.setItem(TENANT_KEY, value);
    else localStorage.removeItem(TENANT_KEY);
  }
}


