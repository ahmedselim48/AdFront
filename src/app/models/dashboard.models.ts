export interface KpiSummary {
  views: number;
  messages: number;
  conversions: number;
  ctr: number;
  alerts: number;
}

export interface ChartSeriesPoint {
  x: string | number | Date;
  y: number;
}

export interface ChartSeries {
  name: string;
  points: ChartSeriesPoint[];
}
