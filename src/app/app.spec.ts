import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the shared application shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('should keep the initial loading screen visible for three seconds', fakeAsync(() => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.loading-overlay') as HTMLElement;
    expect(overlay.classList.contains('visible')).toBeTrue();

    tick(2999);
    fixture.detectChanges();
    expect(overlay.classList.contains('visible')).toBeTrue();

    tick(1);
    fixture.detectChanges();
    expect(overlay.classList.contains('visible')).toBeFalse();
  }));
});
