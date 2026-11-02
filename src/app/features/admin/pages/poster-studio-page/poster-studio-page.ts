import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PosterStudioComponent } from '../../components/poster-studio/poster-studio.component';

@Component({
  selector: 'app-poster-studio-page',
  standalone: true,
  imports: [CommonModule, PosterStudioComponent],
  templateUrl: './poster-studio-page.html',
  styleUrl: './poster-studio-page.scss',
})
export class PosterStudioPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  orderId?: string;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.orderId = params['id'] || params['orderId'] || undefined;
    });
  }

  handleExit(): void {
    if (this.orderId) {
      this.router.navigate(['/quan-tri-viejap'], {
        queryParams: { section: 'orders', id: this.orderId },
      });
    } else {
      this.router.navigate(['/quan-tri-viejap'], {
        queryParams: { section: 'orders' },
      });
    }
  }
}

