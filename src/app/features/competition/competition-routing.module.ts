import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./competition.component').then(m => m.CompetitionComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./competition-dashboard.component').then(m => m.CompetitionDashboardComponent)
      },
      {
        path: 'analyses',
        loadComponent: () => import('./competition-analysis.component').then(m => m.CompetitionAnalysisComponent)
      },
      {
        path: 'analysis/new',
        loadComponent: () => import('./competition-analysis.component').then(m => m.CompetitionAnalysisComponent)
      },
      {
        path: 'analysis/:id',
        loadComponent: () => import('./competition-analysis.component').then(m => m.CompetitionAnalysisComponent)
      },
      {
        path: 'dashboard/:adId',
        loadComponent: () => import('./competition-dashboard.component').then(m => m.CompetitionDashboardComponent)
      },
      {
        path: 'insights',
        loadComponent: () => import('./market-insights.component').then(m => m.MarketInsightsComponent)
      },
      {
        path: 'ai-suggestions',
        loadComponent: () => import('./ai-suggestions.component').then(m => m.AISuggestionsComponent)
      },
      {
        path: 'ai-suggestions/:adId',
        loadComponent: () => import('./ai-suggestions.component').then(m => m.AISuggestionsComponent)
      }
    ]
  }
];
