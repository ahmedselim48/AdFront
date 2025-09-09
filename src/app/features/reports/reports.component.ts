import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ReportsService } from '../../core/services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  form!: FormGroup;
  schedule!: FormGroup;
  constructor(private fb: FormBuilder, private reports: ReportsService){
    this.form = this.fb.group({ from: ['', Validators.required], to: ['', Validators.required], type: ['csv', Validators.required] });
    this.schedule = this.fb.group({ cron: ['0 0 * * *', Validators.required], stype: ['csv']});
  }
  download(){
    if(this.form.invalid) return;
    const { type, from, to } = this.form.value;
    this.reports.download(type, from, to).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `report.${type}`; a.click();
      URL.revokeObjectURL(url);
    });
  }
  saveSchedule(){
    if(this.schedule.invalid) return;
    const { cron, stype } = this.schedule.value;
    this.reports.saveSchedule(cron, stype).subscribe();
  }
}
