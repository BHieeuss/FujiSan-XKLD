export type ActivityLevel = 'standard' | 'featured' | 'hot' | 'special';

export type ActivityStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'published' 
  | 'scheduled' 
  | 'ended' 
  | 'archived';

export type DisplayPosition = 
  | 'featured' 
  | 'hot' 
  | 'latest' 
  | 'category' 
  | 'homepage' 
  | 'related' 
  | 'archive';

export type BlockType = 
  | 'heading' 
  | 'subheading' 
  | 'paragraph' 
  | 'image' 
  | 'gallery' 
  | 'video' 
  | 'quote' 
  | 'divider' 
  | 'event_info' 
  | 'button' 
  | 'callout' 
  | 'bullet_list';

export interface ActivityBlock {
  id: string;
  type: BlockType;
  content: string;
  order: number;
  isVisible: boolean;
  meta?: {
    level?: number;
    caption?: string;
    alt?: string;
    url?: string;
    thumbnail?: string;
    author?: string;
    role?: string;
    layout?: 'grid' | 'carousel' | 'masonry' | 'wide';
    calloutType?: 'info' | 'tip' | 'warning' | 'success';
    buttonStyle?: 'primary' | 'secondary' | 'outline';
    buttonLink?: string;
    images?: Array<{ url: string; caption?: string; alt?: string }>;
    items?: string[];
    eventDate?: string;
    eventLocation?: string;
    eventAttendees?: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export interface HotBadgeConfig {
  enabled: boolean;
  title: string;
  color: string;
  expiresAt: string;
  isExpired?: boolean;
  autoExpire: boolean;
}

export interface FeaturedBadgeConfig {
  enabled: boolean;
  title: string;
  color: string;
  expiresAt?: string;
}

export interface DisplayConfig {
  positions: DisplayPosition[];
  priorityOrder: number;
  startDate?: string;
  endDate?: string;
  autoRemoveEnded: boolean;
}

export interface ActivitySEO {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

export interface ActivityMetrics {
  viewCount: number;
  likeCount: number;
  shareCount: number;
}

export interface ActivityItem {
  id: string;
  code: string;
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  level: ActivityLevel;
  status: ActivityStatus;
  eventDate: string;
  eventTime: string;
  location: string;
  organizer: string;
  participants: string;
  summary: string;
  titleColor?: string;
  textColor?: string;
  metric: string;
  metricLabel: string;
  highlights: string[];
  coverImage: string;
  gallery: string[];
  videoUrl: string;
  videoThumbnail: string;
  templateId: string;
  blocks: ActivityBlock[];
  hotBadge: HotBadgeConfig;
  featuredBadge: FeaturedBadgeConfig;
  displayConfig: DisplayConfig;
  seo: ActivitySEO;
  metrics?: ActivityMetrics;
  viewCount?: number;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  approvalNote?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ActivityCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count?: number;
}

export interface ActivityTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  recommendedCoverRatio: string;
  blocks: Partial<ActivityBlock>[];
}

export interface QualityRuleResult {
  code: string;
  title: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface QualityReport {
  score: number;
  canPublish: boolean;
  errorsCount: number;
  warningsCount: number;
  rules: QualityRuleResult[];
}

export interface ActivityCounts {
  all: number;
  draft: number;
  pending: number;
  approved: number;
  published: number;
  scheduled: number;
  archived: number;
  hot: number;
  featured: number;
  special: number;
}

export interface ActivityListResponse {
  items: ActivityItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: ActivityCounts;
  categories: ActivityCategory[];
  templates: ActivityTemplate[];
}

export interface ActivityFilters {
  q: string;
  status: string;
  level: string;
  category: string;
  badge: string;
  position: string;
  page: number;
  limit: number;
}

