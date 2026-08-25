import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../components/verb-form-arena/verb-form-arena.component';
import { CAUSATIVE_FORM_CONFIG } from '../../components/verb-form-arena/verb-form-configs';

@Component({
  selector: 'app-causative-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class CausativeFormPage {
  readonly config = CAUSATIVE_FORM_CONFIG;
}
