import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AdDto } from '../../../../models/ads.models';

@Component({
  selector: 'app-performance-chart',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './performance-chart.component.html',
  styleUrls: ['./performance-chart.component.scss']
})
export class PerformanceChartComponent {
  @Input() recentAds: AdDto[] = [];

  chartData = {
    labels: [] as string[],
    datasets: [
      {
        label: 'المشاهدات',
        data: [] as number[],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4
      },
      {
        label: 'الإعجابات',
        data: [] as number[],
        borderColor: '#e91e63',
        backgroundColor: 'rgba(233, 30, 99, 0.1)',
        tension: 0.4
      }
    ]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  ngOnInit() {
    this.updateChartData();
  }

  ngOnChanges() {
    this.updateChartData();
  }

  private updateChartData() {
    if (this.recentAds.length > 0) {
      this.chartData.labels = this.recentAds.map(ad => ad.title.length > 20 ? ad.title.substring(0, 20) + '...' : ad.title);
      this.chartData.datasets[0].data = this.recentAds.map(ad => ad.viewsCount);
      this.chartData.datasets[1].data = this.recentAds.map(ad => ad.likesCount);
    }
  }
}
