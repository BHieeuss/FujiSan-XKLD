import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../engine/verb-form-arena.component';
import { CONDITIONAL_FORM_CONFIG } from '../../engine/verb-form-configs';

@Component({
  selector: 'app-conditional-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class ConditionalFormPage {
  readonly config = CONDITIONAL_FORM_CONFIG;
}
