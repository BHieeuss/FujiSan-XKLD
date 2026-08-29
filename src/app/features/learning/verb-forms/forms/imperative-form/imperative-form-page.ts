import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../engine/verb-form-arena.component';
import { IMPERATIVE_FORM_CONFIG } from '../../engine/verb-form-configs';

@Component({
  selector: 'app-imperative-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class ImperativeFormPage {
  readonly config = IMPERATIVE_FORM_CONFIG;
}
