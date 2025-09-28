import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-email-confirmation-message',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="confirmation-container">
      <div class="confirmation-card">
        <div class="icon-container">
          <i class="icon-email"></i>
        </div>
        
        <h2>{{ 'auth.emailConfirmationTitle' | t }}</h2>
        <p class="confirmation-message">
          {{ 'auth.emailConfirmationMessage' | t }}
        </p>
        <p class="email-display">
          <strong>{{ email || 'بريدك الإلكتروني' }}</strong>
        </p>
        
        <div class="instructions">
          <h3>{{ 'auth.nextSteps' | t }}</h3>
          <ol>
            <li>{{ 'auth.checkEmailInbox' | t }}</li>
            <li>{{ 'auth.lookForConfirmationEmail' | t }}</li>
            <li>{{ 'auth.clickConfirmationLink' | t }}</li>
            <li>{{ 'auth.returnToLogin' | t }}</li>
          </ol>
        </div>
        
        <div class="actions">
          <button class="btn-primary" (click)="goToLogin()">
            {{ 'auth.goToLogin' | t }}
          </button>
          <button class="btn-secondary" (click)="onResendEmail()">
            {{ 'auth.resendConfirmation' | t }}
          </button>
        </div>
        
        <div class="help-text">
          <p>{{ 'auth.didntReceiveEmail' | t }}</p>
          <p>{{ 'auth.checkSpamFolder' | t }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 2rem;
    }

    .confirmation-card {
      max-width: 500px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      box-shadow: var(--shadow);
      position: relative;
      overflow: hidden;
    }

    .confirmation-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient);
    }

    .icon-container {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: white;
    }

    .icon-email::before {
      content: '✉️';
    }

    h2 {
      color: var(--text);
      font-size: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .confirmation-message {
      color: var(--muted);
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .email-display {
      color: var(--brand);
      font-size: 1.1rem;
      margin-bottom: 2rem;
      padding: 0.75rem;
      background: rgba(0, 102, 255, 0.1);
      border-radius: 8px;
      border-left: 4px solid var(--brand);
    }

    .instructions {
      text-align: left;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--muted-bg);
      border-radius: 12px;
      border-left: 4px solid var(--brand);
    }

    .instructions h3 {
      color: var(--text);
      font-size: 1.1rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .instructions ol {
      color: var(--muted);
      line-height: 1.8;
      padding-left: 1.2rem;
    }

    .instructions li {
      margin-bottom: 0.5rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 120px;
    }

    .btn-primary {
      background: var(--gradient);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
    }

    .btn-secondary {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--muted-bg);
    }

    .help-text {
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .help-text p {
      margin: 0.5rem 0;
    }

    @media (max-width: 480px) {
      .confirmation-container {
        padding: 1rem;
      }

      .confirmation-card {
        padding: 1.5rem;
      }

      .actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class EmailConfirmationMessageComponent {
  @Input() email!: string;
  @Output() resendEmail = new EventEmitter<void>();

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  onResendEmail() {
    this.resendEmail.emit();
  }
}
