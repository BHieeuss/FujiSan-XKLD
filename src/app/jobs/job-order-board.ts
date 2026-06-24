import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  getJobOrderCategory,
  JobOrder,
  JobOrderCategory,
  JOB_ORDER_CATEGORIES,
} from './job-order.model';
import { JobOrdersApiService } from './job-orders-api.service';

type JobOrderFilter = 'all' | JobOrderCategory;

@Component({
  selector: 'app-job-order-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './job-order-board.html',
  styleUrl: './job-order-board.scss',
})
export class JobOrderBoard implements OnInit {
  @Input() home = false;
  @Input() limit?: number;

  readonly categories = JOB_ORDER_CATEGORIES;
  activeFilter: JobOrderFilter = 'all';
  searchTerm = '';
  orders: JobOrder[] = [];
  loading = true;
  errorMessage = '';

  constructor(private readonly ordersApi: JobOrdersApiService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.orders = await this.ordersApi.listPublic();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách đơn hàng.';
    } finally {
      this.loading = false;
    }
  }

  get visibleOrders(): JobOrder[] {
    const needle = this.searchTerm.trim().toLocaleLowerCase('vi-VN');
    const filtered = this.orders.filter((order) => {
      const matchesCategory = this.activeFilter === 'all' || order.category === this.activeFilter;
      const searchable = `${order.title} ${order.orderCode} ${order.location} ${order.salary}`
        .toLocaleLowerCase('vi-VN');
      return matchesCategory && (!needle || searchable.includes(needle));
    });
    return this.limit ? filtered.slice(0, this.limit) : filtered;
  }

  getCategory(order: JobOrder) {
    return getJobOrderCategory(order.category);
  }

  setFilter(filter: JobOrderFilter): void {
    this.activeFilter = filter;
  }
}
