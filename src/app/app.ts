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
  isLoading = signal(false);

  private routerSub!: Subscription;
  private loadingTimer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {}

  ngOnInit() {
    this.isLoading.set(true);
    this.hideLoadingAfter(850);

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        clearTimeout(this.loadingTimer);
        this.isLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.hideLoadingAfter(220);
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
}
