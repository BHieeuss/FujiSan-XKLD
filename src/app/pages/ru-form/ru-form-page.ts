import { Component } from '@angular/core';
import { VerbFormArenaComponent } from '../../components/verb-form-arena/verb-form-arena.component';
import { RU_FORM_CONFIG } from '../../components/verb-form-arena/verb-form-configs';

@Component({
  selector: 'app-ru-form-page',
  standalone: true,
  imports: [VerbFormArenaComponent],
  template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
})
export class RuFormPage {
  readonly config = RU_FORM_CONFIG;
}
