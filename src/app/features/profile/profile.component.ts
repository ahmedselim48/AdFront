import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile } from '../../models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="profile-wrap">
    <h2>Profile</h2>
    <form [formGroup]="form" (ngSubmit)="save()" class="grid">
      <label>Name<input type="text" formControlName="name"></label>
      <label>Email<input type="email" formControlName="email" disabled></label>
      <label>Plan<select formControlName="plan"><option value="free">Free</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option></select></label>
      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  </section>
  `,
  styles: [`.profile-wrap{max-width:720px;margin:auto;display:block}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:end}
  label{display:flex;flex-direction:column;gap:.25rem}
  input,select{padding:.5rem;border:1px solid #e5e7eb;border-radius:.375rem}
  button{width:max-content;padding:.5rem .75rem;border-radius:.375rem;border:1px solid #111827;background:#111827;color:#fff}`]
})
export class ProfileComponent {
  form = this.fb.group({ id: [''], email: [''], name: ['', Validators.required], plan: ['free', Validators.required] });
  constructor(private fb: FormBuilder, private auth: AuthService){
    this.auth.loadProfile().subscribe((u: UserProfile)=> this.form.patchValue(u));
  }
  save(){ /* integrate with backend when endpoint available */ }
}
