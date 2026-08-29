import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../engine/verb-form-arena.component';
import { TA_FORM_CONFIG } from '../../engine/verb-form-configs';

@Component({
  selector: 'app-ta-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class TaFormPage {
  readonly config = TA_FORM_CONFIG;
}
