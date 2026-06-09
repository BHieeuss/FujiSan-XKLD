import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { APP_CONTACT_INFO } from '../../models/app.config';
import { About } from '../about/about';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [About],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly contactInfo = APP_CONTACT_INFO;

  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;
  isMuted = signal(true);

  toggleMute(): void {
    this.isMuted.set(!this.isMuted());
    if (this.heroVideo) {
      this.heroVideo.nativeElement.muted = this.isMuted();
    }
  }
}
