import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { EventItem } from '../../admin/components/events-admin/events-admin.models';
import { EventsPublicService, PublicEventsResponse } from './events-public.service';

@Component({
  selector: 'app-site-events-coordinator',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './site-events-coordinator.component.html',
  styleUrl: './site-events-coordinator.component.scss',
})
export class SiteEventsCoordinatorComponent implements OnInit, OnDestroy {
  private readonly eventsService = inject(EventsPublicService);
  private readonly router = inject(Router);

  private routerSub?: Subscription;
  private popupTimer?: number;
  private autoCloseTimer?: number;

  // Active items coordinated for display
  topBarEvent: EventItem | null = null;
  centerPopupEvent: EventItem | null = null;
  cornerPopupEvent: EventItem | null = null;
  allActiveEvents: EventItem[] = [];
  fabEventsCount = 0;

  isDrawerOpen = false;
  isCenterPopupOpen = false;
  isCornerPopupOpen = false;
  isCornerMinimized = false;

  private hasShownCenterPopupInSession = false;

  ngOnInit(): void {
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((nav) => {
        if (this.isCenterPopupOpen) {
          this.closeCenterPopup();
        }
        if (this.isDrawerOpen) {
          this.closeDrawer();
        }
        this.evaluateEventsForRoute(nav.urlAfterRedirects.split('?')[0]);
      });

    this.evaluateEventsForRoute(this.router.url.split('?')[0]);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    if (this.popupTimer) {
      clearTimeout(this.popupTimer);
    }
    this.isCenterPopupOpen = false;
    this.isDrawerOpen = false;
    this.updateScrollLock();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isCenterPopupOpen) {
      this.closeCenterPopup();
    } else if (this.isDrawerOpen) {
      this.closeDrawer();
    }
  }

  private updateScrollLock(): void {
    const shouldLock = this.isCenterPopupOpen || this.isDrawerOpen;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = shouldLock ? 'hidden' : '';
      document.documentElement.style.overflow = shouldLock ? 'hidden' : '';
      if (shouldLock) {
        document.body.classList.add('site-event-modal-open');
      } else {
        document.body.classList.remove('site-event-modal-open');
      }
    }
  }

  evaluateEventsForRoute(path: string): void {
    this.eventsService.getActiveEvents(path).subscribe({
      next: (res: PublicEventsResponse) => {
        this.allActiveEvents = res.events || [];
        this.fabEventsCount = this.allActiveEvents.length;

        // 1. Top Announcement Bar
        const topBarCandidates = res.byFormat.top_bar || [];
        const validTopBar = topBarCandidates.find((e) => this.eventsService.canShowEvent(e, 'top_bar'));
        if (validTopBar) {
          this.topBarEvent = validTopBar;
          this.eventsService.recordShown(validTopBar, 'top_bar');
        } else {
          this.topBarEvent = null;
        }

        // 2. Center Modal Popup (Enforce: Max 1 per session, gentle 1.2s delay for seamless UX)
        if (!this.hasShownCenterPopupInSession) {
          const centerCandidates = res.byFormat.popup_center || [];
          const validCenter = centerCandidates.find((e) => this.eventsService.canShowEvent(e, 'popup_center'));

          if (validCenter) {
            this.popupTimer = window.setTimeout(() => {
              this.centerPopupEvent = validCenter;
              this.isCenterPopupOpen = true;
              this.hasShownCenterPopupInSession = true;
              this.updateScrollLock();
              this.eventsService.recordShown(validCenter, 'popup_center');

              const autoCloseSec = validCenter.displayConfig?.popupCenter?.autoCloseSeconds || 0;
              if (autoCloseSec > 0) {
                if (this.autoCloseTimer) window.clearTimeout(this.autoCloseTimer);
                this.autoCloseTimer = window.setTimeout(() => {
                  this.closeCenterPopup();
                }, autoCloseSec * 1000);
              }
            }, 1200);
          }
        }

        // 3. Corner Popup Toast
        const cornerCandidates = res.byFormat.popup_corner || [];
        const validCorner = cornerCandidates.find((e) => this.eventsService.canShowEvent(e, 'popup_corner'));
        if (validCorner && !this.isCenterPopupOpen) {
          this.cornerPopupEvent = validCorner;
          this.isCornerPopupOpen = true;
          this.isCornerMinimized = validCorner.displayConfig?.popupCorner?.autoMinimize || false;
          this.eventsService.recordShown(validCorner, 'popup_corner');
        } else {
          this.cornerPopupEvent = null;
          this.isCornerPopupOpen = false;
        }
      },
    });
  }

  // Action Handlers
  closeTopBar(): void {
    if (this.topBarEvent) {
      this.eventsService.recordDismissed(this.topBarEvent, 'top_bar');
      this.topBarEvent = null;
    }
  }

  closeCenterPopup(): void {
    if (this.autoCloseTimer) {
      window.clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = undefined;
    }
    if (this.centerPopupEvent) {
      this.eventsService.recordDismissed(this.centerPopupEvent, 'popup_center');
    }
    this.isCenterPopupOpen = false;
    this.updateScrollLock();
  }

  closeCornerPopup(): void {
    if (this.cornerPopupEvent) {
      this.eventsService.recordDismissed(this.cornerPopupEvent, 'popup_corner');
      this.isCornerPopupOpen = false;
    }
  }

  toggleCornerMinimize(): void {
    this.isCornerMinimized = !this.isCornerMinimized;
  }

  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.updateScrollLock();
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.updateScrollLock();
  }

  onCtaClick(event: EventItem, format: any): void {
    this.eventsService.recordClick(event, format);
    if (format === 'popup_center') {
      this.isCenterPopupOpen = false;
      this.updateScrollLock();
    } else if (format === 'popup_corner') {
      this.isCornerPopupOpen = false;
    } else if (format === 'list') {
      this.isDrawerOpen = false;
      this.updateScrollLock();
    }
  }
}

