import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './competition-routing.module';

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompetitionModule { }
