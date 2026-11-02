import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { EventItem } from '../../../../admin/components/events-admin/events-admin.models';
import { EventsPublicService } from '../../../events/events-public.service';

@Component({
  selector: 'app-home-event-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-event-banner.component.html',
  styleUrl: './home-event-banner.component.scss',
})
export class HomeEventBannerComponent implements OnInit {
  private readonly eventsService = inject(EventsPublicService);
  bannerEvent: EventItem | null = null;

  ngOnInit(): void {
    this.eventsService.getActiveEvents('/').subscribe({
      next: (res) => {
        const banners = res.byFormat.index_banner || [];
        if (banners.length > 0) {
          this.bannerEvent = banners[0];
          this.eventsService.recordShown(this.bannerEvent, 'index_banner');
        } else {
          this.bannerEvent = null;
        }
      },
      error: () => {
        this.bannerEvent = null;
      },
    });
  }

  onCtaClick(event: EventItem): void {
    this.eventsService.recordClick(event, 'index_banner');
  }
}

