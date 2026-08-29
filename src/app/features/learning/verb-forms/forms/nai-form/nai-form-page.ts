import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../engine/verb-form-arena.component';
import { NAI_FORM_CONFIG } from '../../engine/verb-form-configs';

@Component({
  selector: 'app-nai-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class NaiFormPage {
  readonly config = NAI_FORM_CONFIG;
}
