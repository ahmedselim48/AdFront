import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile } from '../../models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  form!: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService){
    this.form = this.fb.group({ id: [''], email: [''], name: ['', Validators.required], plan: ['free', Validators.required] });
    this.auth.loadProfile().subscribe((u: UserProfile)=> this.form.patchValue(u));
  }
  save(){ }
}
