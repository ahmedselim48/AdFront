// ===== AUTH MODELS =====

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userName: string;
  fullName: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResendConfirmationRequest {
  email: string;
}

export interface VerifyEmailRequest {
  userId: string;
  token: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface SocialLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  roles: string[];
  emailConfirmed: boolean;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface EmailConfirmationResponse {
  success: boolean;
  message: string;
}

export interface SubscriptionStatus {
  hasActive: boolean;
  daysRemaining: number;
  endDate?: Date;
}

export interface UserDashboard {
  totalAds: number;
  publishedAds: number;
  draftAds: number;
  pendingAds: number;
  totalViews: number;
  totalClicks: number;
  totalLikes: number;
  recentAds: any[];
  notifications: any[];
  subscriptionStatus: SubscriptionStatus;
}
