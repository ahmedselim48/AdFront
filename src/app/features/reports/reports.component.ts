import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="reports-wrap">
    <h2>Reports</h2>
    <form [formGroup]="form" (ngSubmit)="download()" class="grid">
      <label>From<input type="date" formControlName="from"></label>
      <label>To<input type="date" formControlName="to"></label>
      <label>Type<select formControlName="type"><option value="csv">CSV</option><option value="pdf">PDF</option></select></label>
      <button type="submit" [disabled]="form.invalid">Generate</button>
    </form>
    <h3>Schedule</h3>
    <form [formGroup]="schedule" (ngSubmit)="saveSchedule()" class="row">
      <input placeholder="Cron e.g. 0 0 * * *" formControlName="cron">
      <select formControlName="stype"><option value="csv">CSV</option><option value="pdf">PDF</option></select>
      <button type="submit">Save</button>
    </form>
  </section>
  `,
  styles: [`.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1rem}
  .row{display:flex;gap:.5rem}
  label{display:flex;flex-direction:column;gap:.25rem}
  input,select{padding:.5rem;border:1px solid #e5e7eb;border-radius:.375rem}
  button{padding:.5rem .75rem;border-radius:.375rem;border:1px solid #111827;background:#111827;color:#fff}
  @media(max-width:760px){.grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:480px){.grid{grid-template-columns:1fr}}`]
})
export class ReportsComponent {
  form = this.fb.group({ from: ['', Validators.required], to: ['', Validators.required], type: ['csv', Validators.required] });
  schedule = this.fb.group({ cron: ['0 0 * * *', Validators.required], stype: ['csv']});
  constructor(private fb: FormBuilder){}
  download(){ /* request backend to stream file; implement */ }
  saveSchedule(){ /* persist schedule via backend */ }
}
