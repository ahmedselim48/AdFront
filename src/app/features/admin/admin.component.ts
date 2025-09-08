import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="admin-wrap">
    <h2>Admin Panel</h2>
    <div class="grid">
      <div>
        <h3>Users</h3>
        <ul class="list">
          <li *ngFor="let u of users">{{u.email}} — {{u.role}}</li>
        </ul>
      </div>
      <div>
        <h3>Tenants</h3>
        <form [formGroup]="tenants" (ngSubmit)="saveTenants()">
          <div class="tenant" *ngFor="let t of tArr.controls; let i = index" [formGroup]="t">
            <input placeholder="Tenant Name" formControlName="name">
            <button type="button" (click)="removeTenant(i)">Remove</button>
          </div>
          <button type="button" (click)="addTenant()">Add Tenant</button>
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  </section>
  `,
  styles: [`.grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
  .list{list-style:none;padding:0}
  .tenant{display:flex;gap:.5rem;margin-bottom:.5rem}
  input{padding:.5rem;border:1px solid #e5e7eb;border-radius:.375rem}
  button{padding:.5rem .75rem;border-radius:.375rem;border:1px solid #111827;background:#111827;color:#fff}
  @media(max-width:760px){.grid{grid-template-columns:1fr}}`]
})
export class AdminComponent {
  users = [{ email: 'admin@example.com', role: 'admin' }, { email: 'user@example.com', role: 'user' }];
  tenants = this.fb.group({ items: this.fb.array([this.fb.group({ name: ['Default'] })]) });
  get tArr(){ return this.tenants.get('items') as FormArray; }
  constructor(private fb: FormBuilder){}
  addTenant(){ this.tArr.push(this.fb.group({ name: [''] })); }
  removeTenant(i: number){ this.tArr.removeAt(i); }
  saveTenants(){ /* integrate with backend */ }
}
