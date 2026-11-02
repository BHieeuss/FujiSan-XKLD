import { Component } from '@angular/core';
import { APP_CONTACT_INFO } from '../../../core/config/app.config';
import { JobOrderBoard } from '../../jobs/components/job-order-board';
import { About } from '../about/about';
import { HomeActivitiesComponent } from './components/home-activities/home-activities.component';
import { HomeEventBannerComponent } from './components/home-event-banner/home-event-banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [About, JobOrderBoard, HomeActivitiesComponent, HomeEventBannerComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly contactInfo = APP_CONTACT_INFO;
}
