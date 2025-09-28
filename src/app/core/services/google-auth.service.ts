import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GoogleLoginRequest, SocialLoginResponse } from '../../models/auth.models';

declare var google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private isGoogleLoaded = new BehaviorSubject<boolean>(false);
  isGoogleLoaded$ = this.isGoogleLoaded.asObservable();

  private readonly GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with actual client ID

  constructor() {
    this.loadGoogleScript();
  }

  /**
   * Load Google Sign-In script
   */
  private loadGoogleScript(): void {
    if (typeof google !== 'undefined') {
      this.isGoogleLoaded.next(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeGoogle();
    };
    document.head.appendChild(script);
  }

  /**
   * Initialize Google Sign-In
   */
  private initializeGoogle(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          // This will be handled by the component
        }
      });
      this.isGoogleLoaded.next(true);
    }
  }

  /**
   * Render Google Sign-In button
   */
  renderButton(element: HTMLElement, options: any = {}): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        ...options
      });
    }
  }

  /**
   * Get Google ID token
   */
  getGoogleIdToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined') {
        reject(new Error('Google Sign-In not loaded'));
        return;
      }

      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          reject(new Error('Google Sign-In prompt was not displayed or was skipped'));
        }
      });

      // Listen for credential response
      const handleCredentialResponse = (response: any) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error('No credential received from Google'));
        }
        // Remove the listener after use
        google.accounts.id.cancel();
      };

      // Set up the callback
      google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
    });
  }

  /**
   * Create Google login request from ID token
   */
  createGoogleLoginRequest(idToken: string, additionalData?: {
    fullName?: string;
    email?: string;
    profilePicture?: string;
  }): GoogleLoginRequest {
    return {
      idToken: idToken,
      fullName: additionalData?.fullName,
      email: additionalData?.email,
      profilePicture: additionalData?.profilePicture
    };
  }

  /**
   * Sign out from Google
   */
  signOut(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.disableAutoSelect();
    }
  }

  /**
   * Check if Google Sign-In is available
   */
  isAvailable(): boolean {
    return typeof google !== 'undefined' && this.isGoogleLoaded.value;
  }
}
