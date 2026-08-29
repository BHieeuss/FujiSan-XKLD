export type YesNo = '' | 'yes' | 'no';
export type MaritalStatus = '' | 'married' | 'separated' | 'divorced' | 'single';
export type Eyesight = '' | 'glasses' | 'no-glasses';
export type Handedness = '' | 'right' | 'left';
export type BloodType = '' | 'A' | 'B' | 'AB' | 'O';
export type LivingStatus = '' | 'together' | 'separate';

export const STUDENT_FORM_STORAGE_KEY = 'viejap.student-form.draft.v1';

export interface EducationEntry {
  from: string;
  to: string;
  school: string;
  major: string;
}

export interface WorkEntry {
  from: string;
  to: string;
  company: string;
  job: string;
}

export interface FamilyEntry {
  fullName: string;
  relationship: string;
  birthYear: string;
  occupation: string;
  livingStatus: LivingStatus;
}

export interface StudentFormData {
  formDate: string;
  fullName: string;
  birthDate: string;
  idNumber: string;
  idIssueDate: string;
  maritalStatus: MaritalStatus;
  address: string;
  phone: string;
  relativePhone: string;
  eyesight: Eyesight;
  handedness: Handedness;
  colorBlind: YesNo;
  limbDisability: YesNo;
  height: string;
  weight: string;
  surgery: YesNo;
  bloodType: BloodType;
  tattoo: YesNo;
  familyMedicalHistory: YesNo;
  alcohol: YesNo;
  smoking: YesNo;
  religion: string;
  trainedSpecialty: string;
  strengths: string;
  weaknesses: string;
  hobbies: string;
  collectiveLiving: YesNo;
  canCook: YesNo;
  selfAssessment: string;
  personalIncome: string;
  familyIncome: string;
  reasonJapan: string;
  savingsGoal: string;
  futurePlan: string;
  abroadBefore: YesNo;
  abroadCountry: string;
  abroadYear: string;
  visaApplied: YesNo;
  studiedLate: boolean;
  studiedEarly: boolean;
  repeatedGrade: boolean;
  studyStatusYear: string;
  familyConsent: YesNo;
  familyJapanHistory: string;
  education: EducationEntry[];
  workHistory: WorkEntry[];
  family: FamilyEntry[];
}

export function createStudentFormData(): StudentFormData {
  return {
    formDate: new Date().toISOString().slice(0, 10),
    fullName: '',
    birthDate: '',
    idNumber: '',
    idIssueDate: '',
    maritalStatus: 'single',
    address: '',
    phone: '',
    relativePhone: '',
    eyesight: 'no-glasses',
    handedness: 'right',
    colorBlind: 'no',
    limbDisability: 'no',
    height: '',
    weight: '',
    surgery: 'no',
    bloodType: 'A',
    tattoo: 'no',
    familyMedicalHistory: 'no',
    alcohol: 'no',
    smoking: 'no',
    religion: '',
    trainedSpecialty: '',
    strengths: '',
    weaknesses: '',
    hobbies: '',
    collectiveLiving: 'yes',
    canCook: 'yes',
    selfAssessment: '',
    personalIncome: '',
    familyIncome: '',
    reasonJapan: '',
    savingsGoal: '',
    futurePlan: '',
    abroadBefore: 'no',
    abroadCountry: '',
    abroadYear: '',
    visaApplied: 'no',
    studiedLate: false,
    studiedEarly: false,
    repeatedGrade: false,
    studyStatusYear: '',
    familyConsent: 'yes',
    familyJapanHistory: '',
    education: Array.from({ length: 4 }, () => ({
      from: '',
      to: '',
      school: '',
      major: '',
    })),
    workHistory: Array.from({ length: 4 }, () => ({
      from: '',
      to: '',
      company: '',
      job: '',
    })),
    family: Array.from({ length: 6 }, () => ({
      fullName: '',
      relationship: '',
      birthYear: '',
      occupation: '',
      livingStatus: '',
    })),
  };
}
