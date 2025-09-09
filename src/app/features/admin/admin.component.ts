import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  users = [{ email: 'admin@example.com', role: 'admin' }, { email: 'user@example.com', role: 'user' }];
  tenants!: FormGroup;
  get tArr(){ return this.tenants.get('items') as FormArray<FormGroup>; }
  constructor(private fb: FormBuilder){
    this.tenants = this.fb.group({ items: this.fb.array([this.fb.group({ name: ['Default'] })]) });
  }
  addTenant(){ this.tArr.push(this.fb.group({ name: [''] })); }
  removeTenant(i: number){ this.tArr.removeAt(i); }
  saveTenants(){ }
}
