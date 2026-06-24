import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { APP_CONTACT_INFO } from '../models/app.config';
import { getJobOrderCategory, JobOrder } from './job-order.model';
import { JobOrdersApiService } from './job-orders-api.service';

@Component({
  selector: 'app-job-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-order-detail-page.html',
  styleUrl: './job-order-detail-page.scss',
})
export class JobOrderDetailPage implements OnInit {
  readonly contactInfo = APP_CONTACT_INFO;
  order?: JobOrder;
  loading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ordersApi: JobOrdersApiService,
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    try {
      this.order = await this.ordersApi.getPublic(id);
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Không thể tải thông tin đơn hàng.';
    } finally {
      this.loading = false;
    }
  }

  get category() {
    return this.order ? getJobOrderCategory(this.order.category) : undefined;
  }

  get requirements(): string[] {
    return this.order?.requirements.split(/\r?\n/).filter(Boolean) ?? [];
  }
}
