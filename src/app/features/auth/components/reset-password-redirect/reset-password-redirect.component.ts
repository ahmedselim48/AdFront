import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password-redirect',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: ``,
})
export class ResetPasswordRedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const email = query.get('email') || undefined;
    const token = query.get('token') || undefined;
    const userId = query.get('userId') || undefined;

    const queryParams: any = {};
    if (email) { queryParams.email = email; }
    if (token) { queryParams.token = token; }
    if (userId) { queryParams.userId = userId; }

    this.router.navigate(['/auth/reset-password'], {
      queryParams,
      replaceUrl: true,
    });
  }
}


