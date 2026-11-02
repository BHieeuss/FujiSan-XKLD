export type EventDisplayFormat = 
  | 'popup_center' 
  | 'popup_corner' 
  | 'top_bar' 
  | 'index_banner' 
  | 'floating_button' 
  | 'list';

export type EventPriorityLevel = 'high' | 'normal' | 'low';

export type EventFrequency = 'per_session' | 'per_day' | 'per_week' | 'once_ever' | 'always';

export type EventStatus = 'draft' | 'scheduled' | 'published' | 'paused' | 'ended';

export type EventCTAActionType = 
  | 'register' 
  | 'view_detail' 
  | 'learn_more' 
  | 'consultation' 
  | 'view_orders' 
  | 'custom';

export interface EventTopBarConfig {
  bgColor: string;
  textColor: string;
  icon: string;
  isClosable: boolean;
}

export interface EventPopupCenterConfig {
  layout: 'horizontal' | 'vertical' | 'banner_top';
  autoCloseSeconds: number;
  backdropClickClose: boolean;
}

export interface EventPopupCornerConfig {
  position: 'bottom_right' | 'bottom_left';
  autoMinimize: boolean;
}

export interface EventIndexBannerConfig {
  position: 'below_hero' | 'below_orders' | 'in_activities' | 'bottom';
  style: 'highlight' | 'navy' | 'card';
}

export interface EventDisplayConfig {
  topBar: EventTopBarConfig;
  popupCenter: EventPopupCenterConfig;
  popupCorner: EventPopupCornerConfig;
  indexBanner: EventIndexBannerConfig;
}

export interface EventCTA {
  enabled: boolean;
  actionType: EventCTAActionType;
  label: string;
  url: string;
  target: '_self' | '_blank';
}

export interface EventSchedule {
  startDate: string;
  endDate: string;
  timezone: string;
  autoPublish: boolean;
  autoEnd: boolean;
}

export interface EventTargeting {
  pages: string[];
  userAudience: 'all' | 'guest_only' | 'logged_in_only';
}

export interface EventDelivery {
  priorityLevel: EventPriorityLevel;
  priorityOrder: number;
  frequency: EventFrequency;
}

export interface EventAnalytics {
  views: number;
  clicks: number;
  dismisses: number;
  byFormat?: Record<string, { views: number; clicks: number }>;
}

export interface EventItem {
  id: string;
  code: string;
  title: string;
  displayTitle: string;
  category: string;
  categoryName: string;
  summary: string;
  content: string;
  coverImage: string;
  bannerImage: string;
  gallery: string[];
  activityId?: string;
  linkToActivity?: boolean;
  displayFormats: EventDisplayFormat[];
  displayConfig: EventDisplayConfig;
  cta: EventCTA;
  schedule: EventSchedule;
  targeting: EventTargeting;
  delivery: EventDelivery;
  status: EventStatus;
  analytics: EventAnalytics;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  endedAt?: string | null;
}

export interface EventCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface EventStats {
  total: number;
  published: number;
  scheduled: number;
  paused: number;
  ended: number;
  draft: number;
  totalViews: number;
  totalClicks: number;
}

export interface EventsResponse {
  items: EventItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: EventStats;
  categories: EventCategory[];
}

