import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form!: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  }
  submit(){
    if(this.form.invalid) return;
    this.auth.register(this.form.value as any).subscribe({
      next: () => this.router.navigateByUrl('/dashboard')
    });
  }
}
