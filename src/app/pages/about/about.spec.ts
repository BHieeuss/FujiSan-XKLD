import { ComponentFixture, TestBed } from '@angular/core/testing';

import { About } from './about';

describe('About', () => {
  let component: About;
  let fixture: ComponentFixture<About>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
    }).compileComponents();

    fixture = TestBed.createComponent(About);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the real company activities', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('#hoat-dong')).toBeTruthy();
    expect(compiled.querySelectorAll('.activity-selector-card').length).toBe(2);
    expect(compiled.querySelector('.activity-story h3')?.textContent).toContain(
      'THPT Sóc Trăng',
    );
  });

  it('should keep the roadmap hidden until requested', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('.program-card').length).toBe(4);
    expect(compiled.querySelectorAll('.program-card-media img').length).toBe(4);

    component.openProgramModal('tokutei');
    fixture.detectChanges();

    expect(compiled.querySelector('.program-roadmap-poster')).toBeFalsy();
    expect(compiled.querySelector('.program-modal-title')?.textContent).toContain('Tokutei');

    component.showProgramRoadmap();
    fixture.detectChanges();

    const guide = compiled.querySelector('.program-roadmap-poster img') as HTMLImageElement;
    expect(guide.src).toContain('/assets/images/TKT/tkt.png');

    component.closeProgramPopupOnEscape();
    fixture.detectChanges();

    expect(component.isProgramRoadmapOpen).toBeFalse();
    expect(component.isProgramPopupOpen).toBeTrue();
  });

  it('should render verified policy information and official sources', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.policy-verified')?.textContent).toContain('07/06/2026');
    expect(compiled.querySelector('.policy-facts')?.textContent).toContain('6,24%/năm');

    const loanSources = compiled.querySelectorAll<HTMLAnchorElement>(
      '.policy-source-footer a[target="_blank"]',
    );
    expect(Array.from(loanSources).some((link) => link.href.includes('vbsp.org.vn'))).toBeTrue();

    component.selectPolicy('policy-nenkin');
    fixture.detectChanges();

    const nenkinSource = compiled.querySelector<HTMLAnchorElement>(
      '.policy-source-footer a[href*="nenkin.go.jp"]',
    );
    expect(nenkinSource).toBeTruthy();
    expect(compiled.querySelector('.policy-panel')?.textContent).toContain('2 năm');
  });

  it('should complete the program matcher without collecting personal data', () => {
    for (let index = 0; index < component.quizQuestions.length; index += 1) {
      component.chooseQuizOption(component.currentQuizQuestion.options[0]);
    }
    fixture.detectChanges();

    expect(component.quizResult?.key).toBe('ky-su');
    expect(fixture.nativeElement.querySelector('.matcher-result h3')?.textContent).toContain(
      'Kỹ sư',
    );

    component.resetQuiz();
    expect(component.quizResult).toBeUndefined();
    expect(component.quizStep).toBe(0);
  });

  it('should render the live order list', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('#don-tuyen iframe')).toBeTruthy();
  });
});
