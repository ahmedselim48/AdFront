import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="auth-card">
    <h2>Reset Password</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>New Password<input type="password" formControlName="newPassword" required></label>
      <button type="submit" [disabled]="form.invalid">Reset</button>
    </form>
  </section>
  `,
  styles: [`.auth-card{max-width:420px;margin:auto;border:1px solid #e5e7eb;border-radius:.5rem;padding:1rem;display:block}
  form{display:flex;flex-direction:column;gap:.75rem}
  label{display:flex;flex-direction:column;gap:.25rem}
  input{padding:.5rem;border:1px solid #e5e7eb;border-radius:.375rem}
  button{padding:.5rem .75rem;border-radius:.375rem;border:1px solid #111827;background:#111827;color:#fff}`]
})
export class ResetPasswordComponent {
  form = this.fb.group({ newPassword: ['', Validators.required] });
  private token = this.route.snapshot.queryParamMap.get('token') ?? '';
  constructor(private fb: FormBuilder, private auth: AuthService, private route: ActivatedRoute, private router: Router) {}
  submit(){ if(this.form.invalid) return; this.auth.resetPassword({ token: this.token, newPassword: this.form.value.newPassword! }).subscribe({ next:()=> this.router.navigateByUrl('/auth/login')}); }
}
