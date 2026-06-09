import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingComponent } from './shared/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  isLoading = signal(true);

  private routerSub?: Subscription;
  private loadingTimer?: ReturnType<typeof setTimeout>;
  private initialLoadingStartedAt = 0;
  private initialLoadingFinished = false;
  private readonly initialLoadingDuration = 3000;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initialLoadingStartedAt = Date.now();
    this.finishInitialLoadingAfterMinimum();

    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.initialLoadingFinished) {
          clearTimeout(this.loadingTimer);
          this.isLoading.set(true);
        }
        return;
      }

      if (
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

  ngOnDestroy(): void {
    clearTimeout(this.loadingTimer);
    this.routerSub?.unsubscribe();
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
