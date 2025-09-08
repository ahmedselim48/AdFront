import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile } from '../../models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  form = this.fb.group({ id: [''], email: [''], name: ['', Validators.required], plan: ['free', Validators.required] });
  constructor(private fb: FormBuilder, private auth: AuthService){
    this.auth.loadProfile().subscribe((u: UserProfile)=> this.form.patchValue(u));
  }
  save(){ /* integrate with backend when endpoint available */ }
}
