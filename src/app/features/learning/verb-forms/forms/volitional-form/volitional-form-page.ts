import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../engine/verb-form-arena.component';
import { VOLITIONAL_FORM_CONFIG } from '../../engine/verb-form-configs';

@Component({
  selector: 'app-volitional-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class VolitionalFormPage {
  readonly config = VOLITIONAL_FORM_CONFIG;
}
