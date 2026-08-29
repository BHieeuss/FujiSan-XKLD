import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgForm } from '@angular/forms';
import { STUDENT_FORM_STORAGE_KEY } from './student-form.model';
import { StudentFormPage } from './student-form-page';

describe('StudentFormPage', () => {
  let fixture: ComponentFixture<StudentFormPage>;
  let component: StudentFormPage;

  beforeEach(async () => {
    localStorage.removeItem(STUDENT_FORM_STORAGE_KEY);
    await TestBed.configureTestingModule({ imports: [StudentFormPage] }).compileComponents();
    fixture = TestBed.createComponent(StudentFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem(STUDENT_FORM_STORAGE_KEY));

  it('should create all rows required by the Excel template', () => {
    expect(component.data.education.length).toBe(4);
    expect(component.data.workHistory.length).toBe(4);
    expect(component.data.family.length).toBe(6);
  });

  it('should mark name, phone and identity number as required', () => {
    const requiredInputs = Array.from(
      fixture.nativeElement.querySelectorAll('input[required]'),
    ) as HTMLInputElement[];
    expect(requiredInputs.map((input) => input.name)).toEqual(['fullName', 'idNumber', 'phone']);
  });

  it('should use the original form checks as defaults', () => {
    expect(component.data.maritalStatus).toBe('single');
    expect(component.data.eyesight).toBe('no-glasses');
    expect(component.data.handedness).toBe('right');
    expect(component.data.colorBlind).toBe('no');
    expect(component.data.bloodType).toBe('A');
    expect(component.data.collectiveLiving).toBe('yes');
    expect(component.data.canCook).toBe('yes');
    expect(component.data.abroadBefore).toBe('no');
    expect(component.data.visaApplied).toBe('no');
    expect(component.data.familyConsent).toBe('yes');
  });

  it('should automatically save and restore entered data', fakeAsync(() => {
    component.data.fullName = 'Nguyễn Văn A';
    component.data.education[0].school = 'THPT Nguyễn Du';
    component.scheduleSave();
    tick(251);

    const stored = JSON.parse(localStorage.getItem(STUDENT_FORM_STORAGE_KEY) ?? '{}');
    expect(stored.fullName).toBe('Nguyễn Văn A');
    expect(stored.education[0].school).toBe('THPT Nguyễn Du');

    fixture.destroy();
    fixture = TestBed.createComponent(StudentFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.data.fullName).toBe('Nguyễn Văn A');
    expect(component.data.education[0].school).toBe('THPT Nguyễn Du');
  }));

  it('should clear saved progress and restore defaults', () => {
    localStorage.setItem(STUDENT_FORM_STORAGE_KEY, JSON.stringify({ fullName: 'Nguyễn Văn A' }));
    component.data.fullName = 'Nguyễn Văn A';
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'scrollTo');
    const form = { resetForm: jasmine.createSpy('resetForm') } as unknown as NgForm;

    component.clearData(form);

    expect(localStorage.getItem(STUDENT_FORM_STORAGE_KEY)).toBeNull();
    expect(component.data.fullName).toBe('');
    expect(component.data.maritalStatus).toBe('single');
    expect(form.resetForm).toHaveBeenCalledWith(component.data);
  });
});
