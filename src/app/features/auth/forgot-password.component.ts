import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form!: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }
  submit(){ if(this.form.invalid) return; this.auth.forgotPassword(this.form.value as any).subscribe(); }
}
