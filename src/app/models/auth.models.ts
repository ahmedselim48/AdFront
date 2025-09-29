// ===== AUTH MODELS =====

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

export interface VerifyEmailRequest {
  userId: string;
  token: string;
}

export interface ConfirmEmailRequest {
  userId: string;
  token: string;
}

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
  profilePicture?: string; // Alias for profileImageUrl for backward compatibility
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
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  phoneNumber?: string;
  profilePicture?: string;
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
