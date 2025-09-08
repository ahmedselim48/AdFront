import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  form = this.fb.group({ from: ['', Validators.required], to: ['', Validators.required], type: ['csv', Validators.required] });
  schedule = this.fb.group({ cron: ['0 0 * * *', Validators.required], stype: ['csv']});
  constructor(private fb: FormBuilder){}
  download(){ /* request backend to stream file; implement */ }
  saveSchedule(){ /* persist schedule via backend */ }
}
