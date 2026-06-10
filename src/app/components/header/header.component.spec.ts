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
    const learningTrigger = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.dropdown-trigger'),
    ).find((button) => button.textContent?.includes('Bài học'));

    learningTrigger?.click();
    fixture.detectChanges();

    const minnaTrigger = compiled.querySelector<HTMLButtonElement>('.nested-trigger');
    expect(minnaTrigger?.textContent).toContain('Minna no Nihongo N5');

    minnaTrigger?.click();
    fixture.detectChanges();

    const nestedMenu = compiled.querySelector('.nested-menu.show');
    expect(nestedMenu).toBeTruthy();
    expect(nestedMenu?.textContent).toContain('Bài 1 · はじめまして');
  });
});
