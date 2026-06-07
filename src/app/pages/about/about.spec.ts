import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { About } from './about';

describe('About', () => {
  let component: About;
  let fixture: ComponentFixture<About>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
      providers: [provideRouter([])],
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
});
