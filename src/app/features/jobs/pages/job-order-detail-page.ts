import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { APP_CONTACT_INFO } from '../../../core/config/app.config';
import {
  getJobOrderCategory,
  getJobOrderFallbackImage,
  getJobOrderTitle,
  JobOrder,
  JobOrderCategory,
  JobOrderCategoryMeta,
  stripJobOrderHtml,
} from '../models/job-order.model';
import { JobOrdersApiService } from '../services/job-orders-api.service';

export interface JobDetailTimelineStep {
  step: number;
  title: string;
  duration: string;
  desc: string;
  icon: string;
}

export interface JobDetailFaq {
  q: string;
  a: string;
}

@Component({
  selector: 'app-job-order-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './job-order-detail-page.html',
  styleUrl: './job-order-detail-page.scss',
})
export class JobOrderDetailPage implements OnInit, OnDestroy {
  readonly contactInfo = APP_CONTACT_INFO;
  readonly getJobOrderFallbackImage = getJobOrderFallbackImage;

  order?: JobOrder;
  relatedOrders: JobOrder[] = [];
  loading = true;
  errorMessage = '';

  // UI state
  showPosterModal = false;
  faqOpenState: Record<number, boolean> = { 0: true, 1: false, 2: false, 3: false, 4: false };

  // 5-Tab Navigation State
  activeTab: 'overview' | 'specs' | 'poster' | 'gallery' | 'process' = 'overview';

  selectTab(tab: 'overview' | 'specs' | 'poster' | 'gallery' | 'process'): void {
    this.activeTab = tab;
  }

  // Consultation quick form state
  consultationSending = false;
  consultationSuccess = false;
  consultationForm = {
    fullName: '',
    phone: '',
    birthYear: '',
    province: '',
    note: '',
  };

  private routeSub?: Subscription;

  readonly timelineSteps: JobDetailTimelineStep[] = [
    {
      step: 1,
      title: 'Tư vấn & Định hướng',
      duration: '1 - 2 ngày',
      desc: 'Cán bộ tuyển dụng VieJap tư vấn chi tiết điều kiện, mức thu nhập và chi phí rõ ràng.',
      icon: 'fas fa-comments',
    },
    {
      step: 2,
      title: 'Khám sức khỏe & Nộp hồ sơ',
      duration: '3 - 5 ngày',
      desc: 'Khám tại bệnh viện đủ điều kiện đi Nhật và hoàn thiện sơ yếu lý lịch đối chiếu.',
      icon: 'fas fa-file-medical',
    },
    {
      step: 3,
      title: 'Phỏng vấn cùng Xí nghiệp Nhật',
      duration: 'Theo lịch xí nghiệp',
      desc: 'Phỏng vấn trực tiếp hoặc trực tuyến với đại diện công ty tiếp nhận tại Nhật Bản.',
      icon: 'fas fa-handshake',
    },
    {
      step: 4,
      title: 'Đào tạo tiếng Nhật & Tác phong',
      duration: '4 - 6 tháng',
      desc: 'Học tiếng Nhật đạt chuẩn N5–N4, rèn luyện văn hóa công sở và kỹ năng sống tại Nhật.',
      icon: 'fas fa-graduation-cap',
    },
    {
      step: 5,
      title: 'Thủ tục COE & Thị thực (Visa)',
      duration: '1 - 2 tháng',
      desc: 'VieJap đại diện nộp hồ sơ xin Tư cách lưu trú (COE) và xin cấp visa xuất cảnh.',
      icon: 'fas fa-passport',
    },
    {
      step: 6,
      title: 'Xuất cảnh & Đồng hành tại Nhật',
      duration: 'Suốt hợp đồng',
      desc: 'Bay sang Nhật làm việc, có cán bộ VieJap đón tại sân bay và hỗ trợ ổn định cuộc sống.',
      icon: 'fas fa-plane-departure',
    },
  ];

  readonly faqs: JobDetailFaq[] = [
    {
      q: 'Mức lương cơ bản và thực lĩnh sau khi trừ các khoản sinh hoạt thế nào?',
      a: 'Lương cơ bản được tính theo quy định tiền lương tối thiểu của từng tỉnh tại Nhật Bản (thường từ 160.000 đến 210.000 Yên/tháng, tương đương ~ 28 - 38 triệu VNĐ). Sau khi trừ thuế, bảo hiểm Shakai Hoken, tiền nhà và tiền điện nước, thu nhập thực lĩnh về tay khoảng 22 - 30 triệu VNĐ (chưa tính tiền làm thêm giờ / tăng ca nhân hệ số 1.25x - 1.5x).',
    },
    {
      q: 'Chưa biết tiếng Nhật thì có đủ điều kiện đăng ký tham gia phỏng vấn không?',
      a: 'Hoàn toàn được! Đa phần các đơn hàng tuyển dụng tiếp nhận ứng viên chưa biết tiếng Nhật. Sau khi trúng tuyển phỏng vấn với nghiệp đoàn, bạn sẽ được nhập học khóa tiếng Nhật và kỹ năng định hướng tại Trung tâm VieJap từ 4 đến 6 tháng trước khi xuất cảnh.',
    },
    {
      q: 'Điều kiện ăn ở, sinh hoạt và phương tiện đi lại tại Nhật Bản ra sao?',
      a: 'Xí nghiệp tiếp nhận tại Nhật Bản bố trí sẵn ký túc xá hoặc căn hộ gần nơi làm việc, đầy đủ tiện nghi như máy giặt, điều hòa 2 chiều, tủ lạnh, bếp nấu ăn, wifi tốc độ cao. Phương tiện đi làm thường là đi bộ, xe đạp hoặc xe buýt đưa đón miễn phí của công ty.',
    },
    {
      q: 'Sau khi hoàn thành hợp đồng về nước, tôi có nhận lại được tiền thuế Nenkin không?',
      a: 'Có! Theo luật pháp Nhật Bản, người lao động nước ngoài sau khi hết hợp đồng và về nước sẽ được làm thủ tục hoàn trả tiền bảo hiểm hưu trí (Nenkin). Số tiền nhận lại sau 3 năm làm việc thường từ 80 đến 120 triệu đồng. VieJap hỗ trợ làm trọn gói thủ tục nhận tiền Nenkin cho học viên.',
    },
    {
      q: 'VieJap có văn phòng hoặc cán bộ hỗ trợ người lao động tại Nhật Bản không?',
      a: 'VieJap có văn phòng liên lạc và mạng lưới đối tác hỗ trợ trực tiếp tại các vùng trọng điểm ở Nhật Bản (Tokyo, Osaka, Aichi, Fukuoka...). Trong suốt thời gian làm việc, học viên luôn được hỗ trợ thông dịch khi đau ốm, gia hạn hợp đồng và giải quyết các thắc mắc.',
    },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ordersApi: JobOrdersApiService,
    private readonly titleService: Title,
    private readonly metaService: Meta,
  ) {}

  ngOnInit(): void {
    // Listen to route parameter changes so navigating between related jobs reloads smoothly
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      if (id) {
        this.loadOrderDetail(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  async loadOrderDetail(id: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      // 1. Fetch public orders list to find current and related orders
      const allOrders = await this.ordersApi.listPublic();

      // Find by exact id or fallback by slug
      let matched = allOrders.find((o) => o.id === id);
      if (!matched) {
        matched = allOrders.find((o) => this.slugify(getJobOrderTitle(o)) === id);
      }

      // If still not found, try direct API get
      if (!matched) {
        matched = await this.ordersApi.getPublic(id);
      }

      this.order = matched;

      // 2. Select 3 related orders (excluding current order)
      this.relatedOrders = allOrders
        .filter((o) => o.id !== matched?.id)
        .sort((a, b) => {
          // Prioritize same category
          if (a.category === matched?.category && b.category !== matched?.category) return -1;
          if (b.category === matched?.category && a.category !== matched?.category) return 1;
          return 0;
        })
        .slice(0, 3);

      // 3. Update SEO and social metadata
      this.updateSeo(matched);

      // 4. Smooth scroll to top
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Không tìm thấy thông tin đơn hàng này.';
    } finally {
      this.loading = false;
    }
  }

  /* ── Metadata & Formatting Helpers ──────────────────────────────── */

  orderTitle(order?: JobOrder): string {
    return order ? getJobOrderTitle(order) : 'Đơn hàng tuyển dụng Nhật Bản';
  }

  orderCategory(order?: JobOrder): JobOrderCategoryMeta {
    return order ? getJobOrderCategory(order.category) : getJobOrderCategory('thuc-pham');
  }

  orderCode(order?: JobOrder): string {
    if (!order) return 'VJ-XKLD';
    if (order.orderCode && order.orderCode.trim()) {
      return order.orderCode.trim();
    }
    const catPrefix: Record<JobOrderCategory, string> = {
      'thuc-pham': 'TP',
      'nong-nghiep': 'NN',
      'co-khi': 'CK',
      'xay-dung': 'XD',
      'dien-tu': 'DT',
      'khac': 'KH',
      'ky-su': 'KS',
      'tokutei': 'TK',
      'thuc-tap-sinh': 'TTS',
      'du-hoc': 'DH',
    };
    const prefix = catPrefix[order.category] || 'VJ';
    return `${prefix}-${order.id.slice(-6).toUpperCase()}`;
  }

  orderLocation(order?: JobOrder): string {
    if (!order || !order.location || !order.location.trim()) return '';
    const loc = order.location.trim();
    if (loc.toLowerCase().includes('nhật bản')) return loc;
    return `${loc} - Nhật Bản`;
  }

  orderLocationDescription(order?: JobOrder): string {
    return '';
  }

  orderSalary(order?: JobOrder): string {
    if (!order) return '';
    return (order.basicSalary || order.salary || '').trim();
  }

  orderSalaryYen(order?: JobOrder): string {
    return this.orderSalary(order);
  }

  orderDuration(order?: JobOrder): string {
    if (!order || !order.contractTerm || !order.contractTerm.trim()) return '';
    return order.contractTerm.trim();
  }

  orderDeparture(order?: JobOrder): string {
    if (!order || !order.departureMonth || !order.departureMonth.trim()) return '';
    const dep = order.departureMonth.trim();
    if (dep.toLowerCase().startsWith('dự kiến')) return dep;
    return `Dự kiến ${dep}`;
  }

  orderAge(order?: JobOrder): string {
    if (!order || !order.ageRange || !order.ageRange.trim()) return '';
    return order.ageRange.trim();
  }

  orderGender(order?: JobOrder): string {
    if (!order || !order.gender || !order.gender.trim()) return '';
    return order.gender.trim();
  }

  orderEducation(order?: JobOrder): string {
    if (!order || !order.education || !order.education.trim()) return '';
    return order.education.trim();
  }

  orderExperience(order?: JobOrder): string {
    if (!order || !order.experience || !order.experience.trim()) return '';
    return order.experience.trim();
  }

  orderQuantity(order?: JobOrder): string {
    if (!order || !order.quantity || !order.quantity.trim()) return '';
    return order.quantity.trim();
  }

  get galleryImages(): string[] {
    if (!this.order?.galleryImages || !Array.isArray(this.order.galleryImages)) {
      return [];
    }
    return this.order.galleryImages
      .filter((src) => Boolean(src && typeof src === 'string' && src.trim()))
      .slice(0, 2);
  }

  get displayImageUrl(): string {
    if (this.order?.imageUrl && !this.order.imageUrl.startsWith('/uploads/orders/don-hang-')) {
      return this.order.imageUrl;
    }
    return this.order ? getJobOrderFallbackImage(this.order.category) : '';
  }

  get hasPoster(): boolean {
    return Boolean(this.order?.posterUrl);
  }

  get displayPosterUrl(): string {
    return this.order?.posterUrl || this.displayImageUrl;
  }

  stripHtml(html: string): string {
    return stripJobOrderHtml(html);
  }

  useFallbackImage(event: Event, order: JobOrder): void {
    const image = event.target as HTMLImageElement;
    const fallback = getJobOrderFallbackImage(order.category);
    if (!image.src.endsWith(fallback)) {
      image.src = fallback;
    }
  }

  toggleFaq(index: number): void {
    this.faqOpenState[index] = !this.faqOpenState[index];
  }

  openPosterModal(): void {
    this.showPosterModal = true;
  }

  closePosterModal(): void {
    this.showPosterModal = false;
  }

  scrollToConsultation(): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('tu-van-don-hang');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    // Fallback: open Zalo directly
    window.open(this.contactInfo.consultationUrl, '_blank');
  }

  submitConsultation(event: Event): void {
    event.preventDefault();
    if (!this.consultationForm.fullName || !this.consultationForm.phone) {
      alert('Vui lòng điền Họ tên và Số điện thoại / Zalo để VieJap hỗ trợ tư vấn.');
      return;
    }

    this.consultationSending = true;

    // Simulate immediate confirmation and prepare direct Zalo message
    setTimeout(() => {
      this.consultationSending = false;
      this.consultationSuccess = true;

      // Construct message for Zalo
      const title = this.orderTitle(this.order);
      const code = this.orderCode(this.order);
      const msg = `Xin chào VieJap! Tôi tên là ${this.consultationForm.fullName} (${this.consultationForm.phone}), sinh năm ${this.consultationForm.birthYear || '---'}, ở ${this.consultationForm.province || '---'}. Tôi muốn đăng ký tư vấn đơn hàng: ${title} [${code}].`;
      const zaloDirectUrl = `https://zalo.me/${this.contactInfo.hotline}?text=${encodeURIComponent(msg)}`;

      // Open Zalo with pre-filled message
      try {
        window.open(zaloDirectUrl, '_blank');
      } catch {}
    }, 600);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private updateSeo(order: JobOrder): void {
    const title = `${this.orderTitle(order)} - Đơn hàng Nhật Bản VieJap`;
    const description = `Tuyển dụng đơn hàng ${this.orderTitle(order)} tại ${this.orderLocation(order)}. Mức lương ${this.orderSalary(order)}, thời hạn ${this.orderDuration(order)}. Đăng ký tư vấn trực tiếp cùng VieJap.`;

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({
      property: 'og:image',
      content: this.displayImageUrl || 'assets/images/jobs/job-thuc-pham.jpg',
    });
  }
}
