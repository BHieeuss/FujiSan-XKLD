import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../components/verb-form-arena/verb-form-arena.component';
import { POTENTIAL_FORM_CONFIG } from '../../components/verb-form-arena/verb-form-configs';

@Component({
  selector: 'app-potential-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class PotentialFormPage {
  readonly config = POTENTIAL_FORM_CONFIG;
}
