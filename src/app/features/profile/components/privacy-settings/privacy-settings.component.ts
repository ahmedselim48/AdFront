import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, Shield, Eye, EyeOff, Save } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-privacy-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    LucideAngularModule
  ],
  templateUrl: './privacy-settings.component.html',
  styleUrls: ['./privacy-settings.component.scss']
})
export class PrivacySettingsComponent implements OnInit {
  privacyForm: FormGroup;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.privacyForm = this.fb.group({
      profileVisibility: ['public'],
      showEmail: [false],
      showPhone: [false],
      showLocation: [true],
      allowMessages: [true],
      allowContactRequests: [true],
      dataSharing: [false],
      analyticsTracking: [true]
    });
  }

  ngOnInit() {}

  onSubmit() {
    this.isSaving = true;
    // Simulate save
    setTimeout(() => {
      this.isSaving = false;
      this.toastr.success('تم حفظ إعدادات الخصوصية', 'تم');
    }, 1000);
  }
}
