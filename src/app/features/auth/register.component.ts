import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="auth-card">
    <h2>Register</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>Name<input type="text" formControlName="name" required></label>
      <label>Email<input type="email" formControlName="email" required></label>
      <label>Password<input type="password" formControlName="password" required></label>
      <button type="submit" [disabled]="form.invalid">Create account</button>
    </form>
    <div class="auth-links">
      <a routerLink="/auth/login">Already have an account?</a>
    </div>
  </section>
  `,
  styles: [`.auth-card{max-width:420px;margin:auto;border:1px solid #e5e7eb;border-radius:.5rem;padding:1rem;display:block}
  form{display:flex;flex-direction:column;gap:.75rem}
  label{display:flex;flex-direction:column;gap:.25rem}
  input{padding:.5rem;border:1px solid #e5e7eb;border-radius:.375rem}
  button{padding:.5rem .75rem;border-radius:.375rem;border:1px solid #111827;background:#111827;color:#fff}
  .auth-links{display:flex;justify-content:flex-end;margin-top:.5rem}
  a{text-decoration:none}`]
})
export class RegisterComponent {
  form = this.fb.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}
  submit(){
    if(this.form.invalid) return;
    this.auth.register(this.form.value as any).subscribe({
      next: () => this.router.navigateByUrl('/dashboard')
    });
  }
}
