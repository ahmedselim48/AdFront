import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
  standalone: true
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number, currency: string = 'SAR', symbol: 'symbol' | 'code' | 'name' = 'symbol', digits: string = '1.0-0', locale: string = 'ar'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      currencyDisplay: symbol,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
