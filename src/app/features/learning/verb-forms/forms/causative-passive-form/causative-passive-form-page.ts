import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../engine/verb-form-arena.component';
import { CAUSATIVE_PASSIVE_FORM_CONFIG } from '../../engine/verb-form-configs';

@Component({
  selector: 'app-causative-passive-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class CausativePassiveFormPage {
  readonly config = CAUSATIVE_PASSIVE_FORM_CONFIG;
}
