import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
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
