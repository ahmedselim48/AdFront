import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  form!: FormGroup;
  schedule!: FormGroup;
  constructor(private fb: FormBuilder){
    this.form = this.fb.group({ from: ['', Validators.required], to: ['', Validators.required], type: ['csv', Validators.required] });
    this.schedule = this.fb.group({ cron: ['0 0 * * *', Validators.required], stype: ['csv']});
  }
  download(){ }
  saveSchedule(){ }
}
