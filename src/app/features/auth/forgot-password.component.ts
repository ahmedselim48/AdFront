import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="auth-card">
    <h2>Forgot Password</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Email<input type="email" formControlName="email" required></label>
      <button type="submit" [disabled]="form.invalid">Send reset link</button>
    </form>
  </section>
  `,
  styles: [`.auth-card{max-width:420px;margin:auto;border:1px solid #e5e7eb;border-radius:.5rem;padding:1rem;display:block}
  form{display:flex;flex-direction:column;gap:.75rem}
  label{display:flex;flex-direction:column;gap:.25rem}
  input{padding:.5rem;border:1px solid #e5e7eb;border-radius:.375rem}
  button{padding:.5rem .75rem;border-radius:.375rem;border:1px solid #111827;background:#111827;color:#fff}`]
})
export class ForgotPasswordComponent {
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  constructor(private fb: FormBuilder, private auth: AuthService) {}
  submit(){ if(this.form.invalid) return; this.auth.forgotPassword(this.form.value as any).subscribe(); }
}
