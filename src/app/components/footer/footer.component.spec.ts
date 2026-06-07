import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('should only enable registration after entering pin 2025', fakeAsync(() => {
    const fixture = TestBed.createComponent(FooterComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openRegistrationGate();
    fixture.detectChanges();
    tick();

    const input = fixture.nativeElement.querySelector('#registration-pin') as HTMLInputElement;
    const continueButton = fixture.nativeElement.querySelector(
      '.registration-continue',
    ) as HTMLButtonElement;

    input.value = '2024';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(continueButton.disabled).toBeTrue();

    input.value = '2025';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(continueButton.disabled).toBeFalse();
  }));

  it('should open the registration form only with the correct pin', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    const component = fixture.componentInstance;
    const openSpy = spyOn(window, 'open');

    component.registrationPinInput = '2024';
    component.continueToRegistration();
    expect(openSpy).not.toHaveBeenCalled();

    component.registrationPinInput = '2025';
    component.continueToRegistration();
    expect(openSpy).toHaveBeenCalledWith(
      jasmine.stringMatching('docs.google.com/forms'),
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('should show the order list inside the website instead of opening a new tab', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    const component = fixture.componentInstance;
    const openSpy = spyOn(window, 'open');
    const orderLink = component.quickAccessLinks.find((link) => link.kind === 'orders');

    component.openQuickAccessLink(orderLink!);
    fixture.detectChanges();

    expect(openSpy).not.toHaveBeenCalled();
    expect(component.isOrderListOpen).toBeTrue();
    expect(document.body.style.overflow).toBe('hidden');
    expect(fixture.nativeElement.querySelector('.order-list-viewer')).toBeTruthy();
  });
});
