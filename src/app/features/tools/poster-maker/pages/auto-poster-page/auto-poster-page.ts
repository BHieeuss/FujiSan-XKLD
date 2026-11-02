import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AiImportModalComponent } from '../../components/ai-import-modal/ai-import-modal.component';
import { TemplateId } from '../../models/poster-template.model';
import { RecruitmentPosterAssets, RecruitmentPosterData } from '../../poster-maker.model';

@Component({
  selector: 'app-auto-poster-page',
  standalone: true,
  imports: [CommonModule, AiImportModalComponent],
  templateUrl: './auto-poster-page.html',
  styleUrl: './auto-poster-page.scss',
})
export class AutoPosterPage implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onApplyAndClose(result: {
    data: RecruitmentPosterData;
    assets: RecruitmentPosterAssets;
    templateId: TemplateId;
  }): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('viejap_applied_poster', JSON.stringify(result));
    }
    this.router.navigate(['/quan-tri-viejap'], {
      queryParams: { section: 'poster' },
    });
  }

  onCreateWebsiteOrder(result: {
    data: RecruitmentPosterData;
    assets: RecruitmentPosterAssets;
    templateId: TemplateId;
  }): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('viejap_applied_poster', JSON.stringify(result));
    }
    this.router.navigate(['/quan-tri-viejap'], {
      queryParams: { section: 'orders', action: 'create' },
    });
  }

  onModalClosed(): void {
    this.router.navigate(['/quan-tri-viejap'], {
      queryParams: { section: 'poster' },
    });
  }
}

