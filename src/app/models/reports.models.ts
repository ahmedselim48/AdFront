export interface ReportRequest {
  type: 'pdf' | 'csv';
  from: string;
  to: string;
  filters?: Record<string, string | number | boolean>;
}

export interface ScheduledReport {
  id: string;
  cron: string;
  type: 'pdf' | 'csv';
  lastRunAt?: string;
}
