import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  form!: FormGroup;
  private token!: string;
  constructor(private fb: FormBuilder, private auth: AuthService, private route: ActivatedRoute, private router: Router) {
    this.form = this.fb.group({ newPassword: ['', Validators.required] });
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }
  submit(){ if(this.form.invalid) return; this.auth.resetPassword({ token: this.token, newPassword: this.form.value.newPassword! }).subscribe({ next:()=> this.router.navigateByUrl('/auth/login')}); }
}
