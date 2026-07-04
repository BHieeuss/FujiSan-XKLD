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

  it('should show Kanji tools as a direct learning page link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    openLearningMenu(compiled);

    const kanjiLink = Array.from(
      compiled.querySelectorAll<HTMLAnchorElement>('.dropdown-menu.show .dropdown-item'),
    ).find((anchor) => anchor.textContent?.includes('Kanji ( Hán Tự )'));

    expect(kanjiLink?.textContent).toContain('Kanji ( Hán Tự )');
    expect(kanjiLink?.getAttribute('href')).toBe('/hoc-kanji');
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
