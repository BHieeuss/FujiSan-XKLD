import {
  Component,
  signal,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { About } from './pages/about/about';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './shared/loading/loading.component';
import { Subscription } from 'rxjs';
import { APP_CONTACT_INFO } from './models/app.config';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    About,
    CommonModule,
    LoadingComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('VieJap - Hợp tác quốc tế');
  protected readonly contactInfo = APP_CONTACT_INFO;

  // Video Controls
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  isMuted = signal(true);

  // Loading state
  isLoading = signal(true);

  private routerSub!: Subscription;
  private loadingTimer?: ReturnType<typeof setTimeout>;
  private initialLoadingStartedAt = 0;
  private initialLoadingFinished = false;
  private readonly initialLoadingDuration = 3000;

  constructor(private router: Router) {}

  ngOnInit() {
    this.initialLoadingStartedAt = Date.now();
    this.finishInitialLoadingAfterMinimum();

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!this.initialLoadingFinished) {
          return;
        }

        clearTimeout(this.loadingTimer);
        this.isLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        if (this.initialLoadingFinished) {
          this.hideLoadingAfter(220);
        } else {
          this.finishInitialLoadingAfterMinimum();
        }
      }
    });
  }

  ngOnDestroy() {
    clearTimeout(this.loadingTimer);
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  toggleMute() {
    this.isMuted.set(!this.isMuted());
    if (this.heroVideo) {
      this.heroVideo.nativeElement.muted = this.isMuted();
    }
  }

  private hideLoadingAfter(delay: number): void {
    clearTimeout(this.loadingTimer);
    this.loadingTimer = setTimeout(() => this.isLoading.set(false), delay);
  }

  private finishInitialLoadingAfterMinimum(): void {
    const elapsed = Date.now() - this.initialLoadingStartedAt;
    const remaining = Math.max(0, this.initialLoadingDuration - elapsed);

    clearTimeout(this.loadingTimer);
    this.loadingTimer = setTimeout(() => {
      this.initialLoadingFinished = true;
      this.isLoading.set(false);
    }, remaining);
  }
}
