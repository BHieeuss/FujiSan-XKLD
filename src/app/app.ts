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
  protected readonly title = signal('FujiSan - Hợp tác quốc tế');

  // Video Controls
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  isMuted = signal(true);

  // Loading state
  isLoading = signal(false);

  private routerSub!: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    // Hiện loading khi khởi động trang lần đầu
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 5000);

    // Lắng nghe sự kiện chuyển trang
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Delay nhỏ để animation mượt hơn
        setTimeout(() => this.isLoading.set(false), 400);
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  // Bật/Tắt âm thanh
  toggleMute() {
    this.isMuted.set(!this.isMuted());
    if (this.heroVideo) {
      this.heroVideo.nativeElement.muted = this.isMuted();
    }
  }
}
