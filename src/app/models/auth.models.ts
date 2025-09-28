<<<<<<< HEAD
// ===== REQUEST MODELS =====
=======
// ===== AUTH MODELS =====
>>>>>>> 51bb64ae2cfdd3a2477bdefc0d36fd34dddcd707

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResendConfirmationRequest {
  email: string;
}

<<<<<<< HEAD
export interface ConfirmEmailRequest {
=======
export interface VerifyEmailRequest {
>>>>>>> 51bb64ae2cfdd3a2477bdefc0d36fd34dddcd707
  userId: string;
  token: string;
}

<<<<<<< HEAD
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
  fullName?: string;
  email?: string;
  profilePicture?: string;
}

export interface UserDashboardDto {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;
  isEmailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  // Add dashboard-specific fields
  totalAds?: number;
  activeAds?: number;
  totalViews?: number;
  totalClicks?: number;
  subscriptionStatus?: SubscriptionStatus;
}

// ===== RESPONSE MODELS =====

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface SocialLoginResponse {
  isNewUser: boolean;
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;
  isEmailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

export interface EmailConfirmationResponse {
  success: boolean;
  message: string;
  authData?: AuthResponse;
}

export interface SubscriptionStatus {
  hasActive: boolean;
  daysRemaining?: number;
  endDate?: string;
}

// ===== LEGACY MODELS (for backward compatibility) =====

=======
export interface GoogleLoginRequest {
  idToken: string;
}

export interface SocialLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

>>>>>>> 51bb64ae2cfdd3a2477bdefc0d36fd34dddcd707
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

<<<<<<< HEAD
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  token: string;
  email: string;
=======
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
>>>>>>> 51bb64ae2cfdd3a2477bdefc0d36fd34dddcd707
}
