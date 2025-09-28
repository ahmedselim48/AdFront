import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LucideAngularModule, Camera, Upload, User, X } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

import { UserProfile } from '../../../../models/auth.models';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    LucideAngularModule
  ],
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent implements OnInit {
  @Input() user: UserProfile | null = null;
  @Output() profileUpdated = new EventEmitter<UserProfile>();

  profileImage: string | null = null;
  isUploading = false;
  isEditing = false;

  // Inject services using inject() function
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    if (this.user?.profilePicture) {
      this.profileImage = this.user.profilePicture;
    }
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('يرجى اختيار ملف صورة صحيح', 'خطأ');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('حجم الملف يجب أن يكون أقل من 5 ميجابايت', 'خطأ');
        return;
      }

      this.isUploading = true;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImage = e.target?.result as string;
        this.uploadImage(file);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(file: File) {
    // Simulate upload - replace with actual upload logic
    setTimeout(() => {
      this.isUploading = false;
      this.toastr.success('تم تحديث الصورة الشخصية بنجاح', 'تم');
      
      // Update user profile
      if (this.user) {
        const updatedUser = { ...this.user, profilePicture: this.profileImage || undefined };
        this.profileUpdated.emit(updatedUser);
      }
    }, 2000);
  }

  removeImage() {
    this.profileImage = null;
    this.toastr.success('تم حذف الصورة الشخصية', 'تم');
    
    // Update user profile
    if (this.user) {
      const updatedUser = { ...this.user, profilePicture: undefined };
      this.profileUpdated.emit(updatedUser);
    }
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    this.isEditing = false;
    // Reset to original image
    if (this.user?.profilePicture) {
      this.profileImage = this.user.profilePicture;
    } else {
      this.profileImage = null;
    }
  }

  getInitials(): string {
    if (!this.user?.fullName) return 'U';
    return this.user.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
