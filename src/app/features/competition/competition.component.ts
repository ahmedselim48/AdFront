import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { CompetitionService, CompetitorRow } from '../../core/services/competition.service';

@Component({
  selector: 'app-competition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss']
})
export class CompetitionComponent {
  filters!: FormGroup;
  rows: CompetitorRow[] = [];
  constructor(private fb: FormBuilder, private competition: CompetitionService){
    this.filters = this.fb.group({ keyword: [''], industry: ['all'] });
    this.search();
  }
  search(){
    const kw = this.filters.get('keyword')?.value || '';
    this.competition.search(kw).subscribe(r => this.rows = r);
  }
  open(_row: CompetitorRow): void {}
}
