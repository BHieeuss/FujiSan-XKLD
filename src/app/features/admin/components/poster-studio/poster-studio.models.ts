import {
  RecruitmentPosterAssets,
  RecruitmentPosterData,
} from '../../../tools/poster-maker/poster-maker.model';
import { TemplateId } from '../../../tools/poster-maker/models/poster-template.model';

export type StudioTab = 'content' | 'images' | 'typography' | 'colors' | 'layout' | 'templates';

export interface CanvasElement {
  id: string;
  name: string;
  icon: string;
  tab: StudioTab;
  topPct: number;
  leftPct: number;
  widthPct: number;
  heightPct: number;
  isVisible: boolean;
  isLocked: boolean;
  zIndex: number;
}

export interface StudioTypography {
  fontFamily: string;
  titleScale: number;      // 0.8 to 1.4
  bodyScale: number;       // 0.8 to 1.3
  salaryScale: number;     // 0.8 to 1.5
  fontWeight: 'normal' | '500' | '600' | '700' | '800';
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number;   // -1 to 3 px
  lineHeight: number;      // 1.2 to 1.8
}

export interface StudioColors {
  primary: string;
  secondary: string;
  accent: string;
  bgStart: string;
  bgEnd: string;
  cardBg: string;
  textHeading: string;
  textBody: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  preview: string[];
  colors: StudioColors;
}

export interface StudioStockPhoto {
  id: string;
  title: string;
  category: string;
  url: string;
}

export interface StudioSnapshot {
  data: RecruitmentPosterData;
  assets: RecruitmentPosterAssets;
  templateId: TemplateId;
  typography: StudioTypography;
  colors: StudioColors;
  elements: CanvasElement[];
  timestamp: number;
}

export type SaveStatus = 'saved' | 'saving' | 'dirty';

