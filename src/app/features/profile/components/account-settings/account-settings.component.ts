import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, User, Mail, Phone, Save, Trash2 } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    LucideAngularModule
  ],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  accountForm: FormGroup;
  isSaving = false;
  isDeleting = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.accountForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      currentPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {}

  onSubmit() {
    if (this.accountForm.valid) {
      this.isSaving = true;
      // Simulate save
      setTimeout(() => {
        this.isSaving = false;
        this.toastr.success('تم تحديث إعدادات الحساب', 'تم');
      }, 1000);
    }
  }

  onDeleteAccount() {
    const confirmed = confirm('هل أنت متأكد من حذف الحساب؟ لا يمكن التراجع عن هذا الإجراء.');
    if (confirmed) {
      this.isDeleting = true;
      // Simulate delete
      setTimeout(() => {
        this.isDeleting = false;
        this.toastr.success('تم حذف الحساب', 'تم');
      }, 2000);
    }
  }
}
