import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../components/verb-form-arena/verb-form-arena.component';
import { PASSIVE_FORM_CONFIG } from '../../components/verb-form-arena/verb-form-configs';

@Component({
  selector: 'app-passive-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class PassiveFormPage {
  readonly config = PASSIVE_FORM_CONFIG;
}
