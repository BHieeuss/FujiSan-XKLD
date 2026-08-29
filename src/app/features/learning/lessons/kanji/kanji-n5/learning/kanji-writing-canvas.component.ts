import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { hintStrokeCount, KanjiLearningStatus } from '../kanji-n5-progress.service';
import { KanjiStrokeData, KanjiStrokePath } from '../kanji-n5-strokes.generated';
import {
  evaluateStroke,
  sampleSvgPath,
  StrokeEvaluation,
  StrokePoint,
} from '../../../../alphabet/hiragana/stroke-evaluator';

interface DrawPoint {
  x: number;
  y: number;
}

interface KanjiWritingCheckResult {
  passed: boolean;
  score: number;
  message: string;
  detail: string;
}

type BrowserWindowWithWebAudio = Window & {
  webkitAudioContext?: new () => AudioContext;
};

@Component({
  selector: 'app-kanji-writing-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="smart-canvas" [ngClass]="'status-' + status">
      <div class="smart-canvas-board">
        <svg
          *ngIf="strokeData"
          class="smart-canvas-hints"
          [attr.viewBox]="strokeData.viewBox"
          aria-hidden="true"
        >
          <path
            *ngFor="let stroke of visibleHintStrokes; trackBy: trackStroke"
            [attr.d]="stroke.path"
            [attr.stroke-opacity]="hintOpacity"
          ></path>
          <g *ngIf="showStrokeOrder">
            <ng-container *ngFor="let stroke of visibleHintStrokes; trackBy: trackStroke">
              <circle [attr.cx]="stroke.start.x" [attr.cy]="stroke.start.y" r="3.5"></circle>
              <text [attr.x]="stroke.start.x" [attr.y]="stroke.start.y + 1.4" text-anchor="middle">
                {{ stroke.order }}
              </text>
            </ng-container>
          </g>
        </svg>

        <canvas
          #drawCanvas
          class="smart-canvas-draw"
          [attr.aria-label]="'Bảng viết chữ ' + kanji"
          (pointerdown)="startStroke($event)"
          (pointermove)="moveStroke($event)"
          (pointerup)="endStroke($event)"
          (pointercancel)="endStroke($event)"
          (pointerleave)="endStroke($event)"
        ></canvas>
      </div>

      <div class="smart-canvas-actions">
        <button type="button" (click)="toggleHints()" [class.active]="showHints">
          <i class="fas fa-eye"></i>
          <span>{{ showHints ? 'Ẩn gợi ý' : 'Hiện gợi ý' }}</span>
        </button>
        <button type="button" (click)="toggleStrokeOrder()" [class.active]="showStrokeOrder">
          <i class="fas fa-list-ol"></i>
          <span>Thứ tự nét</span>
        </button>
        <button type="button" (click)="showNextHintStroke()" [disabled]="!strokeData || hintStep >= strokeTotal">
          <i class="fas fa-arrow-right"></i>
          <span>Nét tiếp theo</span>
        </button>
        <button type="button" class="check-writing" (click)="checkWriting()" [disabled]="!strokeData || !drawnStrokes.length">
          <i class="fas fa-circle-check"></i>
          <span>Kiểm tra</span>
        </button>
        <button type="button" class="sound-toggle" (click)="toggleSound()" [class.active]="soundEnabled" [attr.aria-pressed]="soundEnabled">
          <i [class]="soundEnabled ? 'fas fa-volume-high' : 'fas fa-volume-xmark'"></i>
          <span>{{ soundEnabled ? 'Âm thanh' : 'Tắt âm' }}</span>
        </button>
        <button type="button" (click)="resetWriting()">
          <i class="fas fa-rotate-right"></i>
          <span>Viết lại</span>
        </button>
        <button type="button" (click)="undoStroke()" [disabled]="!drawnStrokes.length">
          <i class="fas fa-rotate-left"></i>
          <span>Xóa nét vừa viết</span>
        </button>
        <button type="button" (click)="clearAll()" [disabled]="!drawnStrokes.length">
          <i class="fas fa-trash-can"></i>
          <span>Xóa toàn bộ</span>
        </button>
      </div>

      <p class="smart-canvas-note">
        Gợi ý đang hiện {{ visibleHintStrokes.length }}/{{ strokeTotal }} nét. Mức gợi ý:
        <strong>{{ hintLevel }}%</strong>.
      </p>

      <p
        *ngIf="checkResult"
        class="smart-canvas-result"
        [class.is-correct]="checkResult.passed"
        [class.is-wrong]="!checkResult.passed"
        aria-live="polite"
      >
        <i [class]="checkResult.passed ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'"></i>
        <span>
          <strong>{{ checkResult.message }}</strong>
          {{ checkResult.detail }}
        </span>
      </p>
    </section>
  `,
  styleUrl: './kanji-learning.components.scss',
})
export class KanjiWritingCanvasComponent implements AfterViewInit, OnChanges {
  @Input() kanji = '';
  @Input() strokeData?: KanjiStrokeData;
  @Input() status: KanjiLearningStatus = 'new';
  @Input() hintLevel = 100;

  @ViewChild('drawCanvas') private readonly canvasRef?: ElementRef<HTMLCanvasElement>;

  showHints = true;
  showStrokeOrder = false;
  hintStep = 0;
  drawnStrokes: DrawPoint[][] = [];
  checkResult?: KanjiWritingCheckResult;
  soundEnabled = true;

  private currentStroke: DrawPoint[] = [];
  private drawing = false;
  private isTouchInput = false;
  private audioContext?: AudioContext;
  private lastPaperSoundAt = 0;
  private lastPaperPoint?: DrawPoint;

  get strokeTotal(): number {
    return this.strokeData?.strokes.length ?? 0;
  }

  get visibleHintStrokes(): KanjiStrokePath[] {
    if (!this.showHints || !this.strokeData) {
      return [];
    }
    return this.strokeData.strokes.slice(0, Math.min(this.hintStep, this.strokeTotal));
  }

  get hintOpacity(): number {
    if (this.status === 'new') {
      return 0.32;
    }
    if (this.status === 'learning') {
      return 0.22;
    }
    if (this.status === 'almost_remembered') {
      return 0.18;
    }
    if (this.status === 'need_review') {
      return 0.28;
    }
    return 0;
  }

  ngAfterViewInit(): void {
    this.resetHintStep();
    this.resizeCanvas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['strokeData'] || changes['status']) {
      this.resetHintStep();
      this.clearAll();
    }
    window.setTimeout(() => this.resizeCanvas());
  }

  @HostListener('window:resize')
  resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    const context = canvas.getContext('2d');
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.redraw();
  }

  toggleHints(): void {
    this.showHints = !this.showHints;
    if (this.showHints && this.hintStep === 0) {
      this.resetHintStep();
    }
  }

  toggleStrokeOrder(): void {
    this.showStrokeOrder = !this.showStrokeOrder;
  }

  showNextHintStroke(): void {
    this.showHints = true;
    this.hintStep = Math.min(this.hintStep + 1, this.strokeTotal);
  }

  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      void this.playCheckSound(true);
    } else if (this.audioContext?.state === 'running') {
      void this.audioContext.suspend().catch(() => undefined);
    }
  }

  resetWriting(): void {
    this.clearAll();
    this.resetHintStep();
  }

  undoStroke(): void {
    this.drawnStrokes = this.drawnStrokes.slice(0, -1);
    this.checkResult = undefined;
    this.redraw();
  }

  clearAll(): void {
    this.currentStroke = [];
    this.drawnStrokes = [];
    this.drawing = false;
    this.checkResult = undefined;
    this.redraw();
  }

  checkWriting(): void {
    if (!this.strokeData) {
      this.setCheckResult({
        passed: false,
        score: 0,
        message: 'Chưa có dữ liệu nét mẫu.',
        detail: 'Hãy chọn chữ khác hoặc thử tải lại trang.',
      });
      return;
    }

    if (!this.drawnStrokes.length) {
      this.setCheckResult({
        passed: false,
        score: 0,
        message: 'Chưa có nét để kiểm tra.',
        detail: 'Viết chữ vào bảng rồi bấm Kiểm tra.',
      });
      return;
    }

    if (this.drawnStrokes.length !== this.strokeTotal) {
      const missing = this.drawnStrokes.length < this.strokeTotal;
      this.setCheckResult({
        passed: false,
        score: Math.round((Math.min(this.drawnStrokes.length, this.strokeTotal) / this.strokeTotal) * 45),
        message: missing ? 'Còn thiếu nét.' : 'Đang thừa nét.',
        detail: `Bạn viết ${this.drawnStrokes.length}/${this.strokeTotal} nét. Viết đúng số nét rồi bấm Kiểm tra lại.`,
      });
      return;
    }

    const evaluations = this.strokeData.strokes.map((stroke, index) =>
      evaluateStroke(
        this.normalizeUserStroke(this.drawnStrokes[index]),
        this.referenceStrokePoints(stroke),
        this.isTouchInput,
      ),
    );
    const passedCount = evaluations.filter((result) => result.passed).length;
    const score = Math.round(
      (evaluations.reduce((sum, result) => sum + this.scoreForEvaluation(result), 0) /
        Math.max(evaluations.length, 1)) *
        100,
    );
    const passed = passedCount === this.strokeTotal && score >= 72;

    this.setCheckResult({
      passed,
      score,
      message: passed ? 'Đúng rồi.' : 'Chưa khớp.',
      detail: passed
        ? `Thứ tự và dáng nét ổn. Điểm gợi ý: ${score}/100.`
        : this.checkFailureDetail(evaluations, passedCount, score),
    });
  }

  startStroke(event: PointerEvent): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    canvas.setPointerCapture(event.pointerId);
    this.drawing = true;
    this.isTouchInput = event.pointerType === 'touch';
    this.checkResult = undefined;
    const point = this.pointFromEvent(event);
    this.currentStroke = [point];
    this.lastPaperPoint = undefined;
    void this.playPaperSound(point, true);
    event.preventDefault();
  }

  moveStroke(event: PointerEvent): void {
    if (!this.drawing) {
      return;
    }
    const point = this.pointFromEvent(event);
    this.currentStroke.push(point);
    void this.playPaperSound(point);
    this.redraw();
    event.preventDefault();
  }

  endStroke(event: PointerEvent): void {
    if (!this.drawing) {
      return;
    }
    if (this.currentStroke.length > 1) {
      this.drawnStrokes = [...this.drawnStrokes, this.currentStroke];
    }
    this.currentStroke = [];
    this.drawing = false;
    this.lastPaperPoint = undefined;
    this.redraw();
    event.preventDefault();
  }

  trackStroke(_: number, stroke: KanjiStrokePath): number {
    return stroke.order;
  }

  private setCheckResult(result: KanjiWritingCheckResult): void {
    this.checkResult = result;
    void this.playCheckSound(result.passed);
  }

  private ensureAudioContext(): AudioContext | undefined {
    if (!this.soundEnabled || typeof window === 'undefined') {
      return undefined;
    }

    if (this.audioContext?.state === 'closed') {
      this.audioContext = undefined;
    }

    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext ?? (window as BrowserWindowWithWebAudio).webkitAudioContext;
      if (!AudioContextClass) {
        return undefined;
      }
      this.audioContext = new AudioContextClass();
    }

    return this.audioContext;
  }

  private async activeAudioContext(): Promise<AudioContext | undefined> {
    const context = this.ensureAudioContext();
    if (!context) {
      return undefined;
    }

    if (context.state === 'suspended') {
      await context.resume().catch(() => undefined);
    }

    return context.state === 'running' ? context : undefined;
  }

  private async playCheckSound(passed: boolean): Promise<void> {
    const context = await this.activeAudioContext();
    if (!context) {
      return;
    }

    const startAt = context.currentTime;
    if (passed) {
      this.playTone(context, 523.25, 0.1, 0.12, startAt, 659.25, 'sine');
      this.playTone(context, 783.99, 0.16, 0.1, startAt + 0.09, 987.77, 'sine');
      return;
    }

    this.playTone(context, 246.94, 0.24, 0.13, startAt, 164.81, 'triangle');
  }

  private playTone(
    context: AudioContext,
    frequency: number,
    duration: number,
    volume: number,
    startAt: number,
    endFrequency = frequency,
    type: OscillatorType = 'sine',
  ): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const fadeInAt = startAt + Math.min(0.012, duration * 0.35);
    const endAt = startAt + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), endAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), fadeInAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }

  private async playPaperSound(point: DrawPoint, force = false): Promise<void> {
    const previous = this.lastPaperPoint;
    if (!force && previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 5) {
      return;
    }

    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!force && nowMs - this.lastPaperSoundAt < 42) {
      return;
    }

    const context = await this.activeAudioContext();
    if (!context) {
      return;
    }

    this.lastPaperPoint = point;
    this.lastPaperSoundAt = nowMs;

    const duration = this.isTouchInput ? 0.045 : 0.06;
    const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      const fade = 1 - index / frameCount;
      data[index] = (Math.random() * 2 - 1) * fade;
    }

    const startAt = context.currentTime;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(this.isTouchInput ? 760 : 1080, startAt);
    filter.Q.setValueAtTime(0.9, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(this.isTouchInput ? 0.04 : 0.052, startAt + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(startAt);
    source.stop(startAt + duration + 0.01);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  private resetHintStep(): void {
    this.hintStep = this.strokeData ? hintStrokeCount(this.strokeTotal, this.status) : 0;
  }

  private pointFromEvent(event: PointerEvent): DrawPoint {
    const rect = this.canvasRef?.nativeElement.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  }

  private normalizeUserStroke(stroke: DrawPoint[]): StrokePoint[] {
    const rect = this.canvasRef?.nativeElement.getBoundingClientRect();
    const width = Math.max(rect?.width ?? 1, 1);
    const height = Math.max(rect?.height ?? 1, 1);
    return stroke.map((point) => ({
      x: (point.x / width) * 1024,
      y: (point.y / height) * 1024,
    }));
  }

  private referenceStrokePoints(stroke: KanjiStrokePath): StrokePoint[] {
    const [minX, minY, width, height] = this.parsedViewBox();
    return sampleSvgPath(stroke.path).map((point) => ({
      x: ((point.x - minX) / width) * 1024,
      y: ((point.y - minY) / height) * 1024,
    }));
  }

  private parsedViewBox(): [number, number, number, number] {
    const values = (this.strokeData?.viewBox ?? '0 0 109 109')
      .split(/\s+/)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    return [
      values[0] ?? 0,
      values[1] ?? 0,
      Math.max(values[2] ?? 109, 1),
      Math.max(values[3] ?? 109, 1),
    ];
  }

  private scoreForEvaluation(evaluation: StrokeEvaluation): number {
    if (evaluation.passed) {
      return 1;
    }
    if (evaluation.reason === 'wrong-direction') {
      return 0.28;
    }
    if (evaluation.reason === 'too-short') {
      return 0.18;
    }
    const coverageScore = Math.min(Math.max(evaluation.coverage, 0), 1);
    const distanceScore = Math.max(0, 1 - evaluation.averageDistance / 260);
    return Math.max(0.25, Math.min(0.72, coverageScore * 0.55 + distanceScore * 0.45));
  }

  private checkFailureDetail(
    evaluations: StrokeEvaluation[],
    passedCount: number,
    score: number,
  ): string {
    if (evaluations.some((result) => result.reason === 'wrong-direction')) {
      return `Có nét bắt đầu/kết thúc ngược hướng mẫu. Đúng ${passedCount}/${this.strokeTotal} nét, điểm ${score}/100.`;
    }
    if (evaluations.some((result) => result.reason === 'too-short')) {
      return `Có nét quá ngắn hoặc bị đứt. Đúng ${passedCount}/${this.strokeTotal} nét, điểm ${score}/100.`;
    }
    return `Dáng nét còn lệch mẫu. Đúng ${passedCount}/${this.strokeTotal} nét, điểm ${score}/100.`;
  }

  private redraw(): void {
    const canvas = this.canvasRef?.nativeElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#101827';
    context.lineWidth = Math.max(5, rect.width * 0.018);
    for (const stroke of [...this.drawnStrokes, this.currentStroke]) {
      this.drawUserStroke(context, stroke);
    }
  }

  private drawUserStroke(context: CanvasRenderingContext2D, stroke: DrawPoint[]): void {
    if (stroke.length < 2) {
      return;
    }
    context.beginPath();
    context.moveTo(stroke[0].x, stroke[0].y);
    for (const point of stroke.slice(1)) {
      context.lineTo(point.x, point.y);
    }
    context.stroke();
  }
}
