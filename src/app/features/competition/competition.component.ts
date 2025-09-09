import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-competition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss']
})
export class CompetitionComponent {
  filters!: FormGroup;
  rows = [{ name: 'Competitor A', count: 12, ctr: 1.8 }, { name: 'Competitor B', count: 8, ctr: 2.1 }];
  constructor(private fb: FormBuilder){
    this.filters = this.fb.group({ keyword: [''], industry: ['all'] });
  }
  open(_row: { name: string; count: number; ctr: number }): void {}
}
