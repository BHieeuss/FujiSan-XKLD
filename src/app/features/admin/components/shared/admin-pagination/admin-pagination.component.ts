import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-pagination.component.html',
  styleUrls: ['./admin-pagination.component.scss'],
})
export class AdminPaginationComponent {
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() disabled: boolean = false;
  @Input() autoHide: boolean = true;
  @Input() itemLabel: string = 'bản ghi';

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    if (!this.totalItems || this.totalItems <= 0) return 1;
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get startItem(): number {
    if (!this.totalItems || this.totalItems <= 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    if (!this.totalItems || this.totalItems <= 0) return 0;
    return Math.min(this.totalItems, this.currentPage * this.pageSize);
  }

  get isFirstPage(): boolean {
    return this.currentPage <= 1;
  }

  get isLastPage(): boolean {
    return this.currentPage >= this.totalPages;
  }

  get shouldShow(): boolean {
    if (this.autoHide && this.totalItems <= this.pageSize) {
      return false;
    }
    return this.totalItems > 0;
  }

  get pages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      const result: number[] = [];
      for (let i = 1; i <= total; i++) {
        result.push(i);
      }
      return result;
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  goToPage(page: number | string): void {
    if (this.disabled) return;
    if (typeof page !== 'number') return;
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.pageChange.emit(page);
  }

  prevPage(): void {
    if (!this.isFirstPage && !this.disabled) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (!this.isLastPage && !this.disabled) {
      this.goToPage(this.currentPage + 1);
    }
  }
}

