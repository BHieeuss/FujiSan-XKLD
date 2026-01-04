import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { About } from './pages/about/about';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, About, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('FujiSan - Hợp tác quốc tế');

  // Video Controls
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  isMuted = signal(true);

  // Bật/Tắt âm thanh
  toggleMute() {
    this.isMuted.set(!this.isMuted());
    if (this.heroVideo) {
      this.heroVideo.nativeElement.muted = this.isMuted();
    }
  }
}
