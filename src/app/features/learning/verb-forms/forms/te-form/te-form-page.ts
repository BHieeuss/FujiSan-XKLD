import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../engine/verb-form-arena.component';
import { TE_FORM_CONFIG } from '../../engine/verb-form-configs';

@Component({
  selector: 'app-te-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class TeFormPage {
  readonly config = TE_FORM_CONFIG;
}
