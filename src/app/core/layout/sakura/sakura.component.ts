import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SakuraPetal {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  rotation: number;
  opacity: number;
  variant: number;
}

@Component({
  selector: 'app-sakura',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sakura-container" aria-hidden="true">
      @for (petal of petals; track petal.id) {
        <span
          class="sakura-petal"
          [class]="'sakura-petal variant-' + petal.variant"
          [style.left.vw]="petal.left"
          [style.--fall-duration]="petal.duration + 's'"
          [style.--fall-delay]="petal.delay + 's'"
          [style.--drift]="petal.drift + 'vw'"
          [style.--petal-size]="petal.size + 'px'"
          [style.--rotation]="petal.rotation + 'deg'"
          [style.opacity]="petal.opacity"
        ></span>
      }
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      z-index: 9999;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .sakura-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .sakura-petal {
      position: absolute;
      top: -40px;
      display: block;
      width: var(--petal-size, 14px);
      height: var(--petal-size, 14px);
      background: radial-gradient(
        ellipse at 30% 30%,
        #ffd6e0 0%,
        #ffb7c8 35%,
        #f8a4b8 60%,
        #f48da8 100%
      );
      border-radius: 130% 0% 130% 0%;
      box-shadow: inset -2px -1px 3px rgba(244, 141, 168, 0.35);
      animation:
        sakura-fall var(--fall-duration, 8s) var(--fall-delay, 0s) linear infinite,
        sakura-sway var(--fall-duration, 8s) var(--fall-delay, 0s) ease-in-out infinite,
        sakura-spin var(--fall-duration, 8s) var(--fall-delay, 0s) linear infinite;
      will-change: transform;
    }

    .sakura-petal.variant-1 {
      background: radial-gradient(
        ellipse at 35% 25%,
        #ffe0e8 0%,
        #ffc4d4 40%,
        #ffadc2 100%
      );
      border-radius: 0% 130% 0% 130%;
    }

    .sakura-petal.variant-2 {
      background: radial-gradient(
        ellipse at 40% 30%,
        #fff0f3 0%,
        #ffd6e0 30%,
        #f9b8ca 70%,
        #f09db5 100%
      );
      border-radius: 130% 0% 130% 0%;
      box-shadow:
        inset -1px -1px 2px rgba(240, 157, 181, 0.3),
        0 0 4px rgba(255, 183, 200, 0.15);
    }

    @keyframes sakura-fall {
      0% {
        top: -40px;
        opacity: 0;
      }
      5% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        top: calc(100vh + 40px);
        opacity: 0;
      }
    }

    @keyframes sakura-sway {
      0%, 100% {
        transform: translateX(0) rotate(0deg);
      }
      25% {
        transform: translateX(var(--drift, 3vw)) rotate(calc(var(--rotation, 45deg) * 0.5));
      }
      50% {
        transform: translateX(calc(var(--drift, 3vw) * -0.6)) rotate(var(--rotation, 45deg));
      }
      75% {
        transform: translateX(calc(var(--drift, 3vw) * 0.8)) rotate(calc(var(--rotation, 45deg) * 1.5));
      }
    }

    @keyframes sakura-spin {
      0% {
        filter: brightness(1);
      }
      50% {
        filter: brightness(1.1);
      }
      100% {
        filter: brightness(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .sakura-petal {
        animation: none;
        display: none;
      }
    }
  `],
})
export class SakuraComponent implements OnInit, OnDestroy {
  petals: SakuraPetal[] = [];
  private intervalId?: ReturnType<typeof setInterval>;
  private petalCounter = 0;
  private readonly maxPetals = 25;

  ngOnInit(): void {
    // Tạo batch ban đầu với delay ngẫu nhiên
    for (let i = 0; i < 15; i++) {
      this.petals.push(this.createPetal(Math.random() * 10));
    }

    // Thêm cánh hoa mới mỗi 3 giây
    this.intervalId = setInterval(() => {
      if (this.petals.length < this.maxPetals) {
        this.petals.push(this.createPetal(0));
      }
    }, 3000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  private createPetal(extraDelay: number): SakuraPetal {
    return {
      id: ++this.petalCounter,
      left: Math.random() * 100,
      size: 8 + Math.random() * 12,
      delay: extraDelay + Math.random() * 5,
      duration: 7 + Math.random() * 9,
      drift: 2 + Math.random() * 5,
      rotation: 30 + Math.random() * 300,
      opacity: 0.5 + Math.random() * 0.45,
      variant: Math.floor(Math.random() * 3),
    };
  }
}
