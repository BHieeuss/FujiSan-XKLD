import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent learning menu', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('should expand Minna no Nihongo N5 and show lesson 1', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    openLearningMenu(compiled);

    const minnaTrigger = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.nested-trigger'),
    ).find((button) => button.textContent?.includes('Minna no Nihongo N5'));
    expect(minnaTrigger?.textContent).toContain('Minna no Nihongo N5');

    minnaTrigger?.click();
    fixture.detectChanges();

    const nestedMenu = Array.from(compiled.querySelectorAll('.nested-menu.show')).find((menu) =>
      menu.textContent?.includes('Bài 1 · はじめまして'),
    );
    expect(nestedMenu).toBeTruthy();
  });

  it('should show Kanji N5 as a direct lesson page link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    openLearningMenu(compiled);

    const kanjiTrigger = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.nested-trigger'),
    ).find((button) => button.textContent?.includes('Kanji ( Hán Tự )'));
    expect(kanjiTrigger?.textContent).toContain('Kanji ( Hán Tự )');

    kanjiTrigger?.click();
    fixture.detectChanges();

    const n5Link = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('.nested-menu.show .dropdown-item'),
    ).find((anchor) => anchor.textContent?.includes('N5'));

    expect(n5Link?.textContent).toContain('N5');
    expect(n5Link?.getAttribute('href')).toBe('/hoc-kanji-n5/bai-1');
    expect(compiled.querySelector('.deep-menu')).toBeFalsy();
  });

  function openLearningMenu(compiled: HTMLElement): void {
    const learningTrigger = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.dropdown-trigger'),
    ).find((button) => button.textContent?.includes('Bài học'));

    learningTrigger?.click();
    fixture.detectChanges();
  }
});
