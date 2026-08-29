import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../engine/verb-form-arena.component';
import { PROHIBITIVE_FORM_CONFIG } from '../../engine/verb-form-configs';

@Component({
  selector: 'app-prohibitive-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class ProhibitiveFormPage {
  readonly config = PROHIBITIVE_FORM_CONFIG;
}
