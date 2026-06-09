import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlyphStrokeData } from './stroke-data.generated';
import {
  evaluateStroke,
  sampleSvgPath,
  StrokeEvaluation,
  StrokePoint,
} from './stroke-evaluator';

@Component({
  selector: 'app-stroke-pad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stroke-pad.component.html',
  styleUrl: './stroke-pad.component.scss',
})
export class StrokePadComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) data!: GlyphStrokeData;
  @Input() active = true;
  @Input() label = '';
  @Input() resetToken = 0;

  @Output() padCompleted = new EventEmitter<void>();
  @Output() padSkipped = new EventEmitter<void>();

  @ViewChild('drawingCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  currentStrokeIndex = 0;
  failedAttempts = 0;
  showAnimation = true;
  showHint = false;
  statusMessage = 'Xem nét mẫu rồi viết theo đúng thứ tự.';
  isComplete = false;

  private acceptedStrokes: StrokePoint[][] = [];
  private currentStroke: StrokePoint[] = [];
  private activePointerId?: number;
  private isTouchInput = false;
  private resizeObserver?: ResizeObserver;
  private animationTimer?: ReturnType<typeof setTimeout>;

  constructor(private zone: NgZone) {}

  get strokeCount(): number {
    return this.data?.medians.length ?? 0;
  }

  get currentGuidePath(): string | undefined {
    return this.data?.medians[this.currentStrokeIndex];
  }

  get acceptedStrokeCount(): number {
    return this.acceptedStrokes.length;
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(canvas);
    this.resizeCanvas();
    this.startAnimationTimer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['resetToken']) {
      this.resetPad();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    clearTimeout(this.animationTimer);
  }

  onPointerDown(event: PointerEvent): void {
    if (!this.active || this.isComplete || this.activePointerId !== undefined) {
      return;
    }

    event.preventDefault();
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    this.showAnimation = false;
    this.isTouchInput = event.pointerType === 'touch';
    this.activePointerId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    this.currentStroke = [this.toCanvasPoint(event)];
    this.statusMessage = `Đang viết nét ${this.currentStrokeIndex + 1}/${this.strokeCount}`;
    this.redraw();
  }

  onPointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    event.preventDefault();
    const nextPoint = this.toCanvasPoint(event);
    const previousPoint = this.currentStroke[this.currentStroke.length - 1];
    if (!previousPoint || Math.hypot(nextPoint.x - previousPoint.x, nextPoint.y - previousPoint.y) > 4) {
      this.currentStroke.push(nextPoint);
      this.redraw();
    }
  }

  onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }

    event.preventDefault();
    const canvas = this.canvasRef?.nativeElement;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    this.activePointerId = undefined;

    const referencePath = this.currentGuidePath;
    const evaluation = referencePath
      ? evaluateStroke(this.currentStroke, sampleSvgPath(referencePath), this.isTouchInput)
      : undefined;
    this.finishStroke(evaluation);
  }

  onPointerCancel(event: PointerEvent): void {
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    this.activePointerId = undefined;
    this.currentStroke = [];
    this.statusMessage = 'Nét vừa viết đã được hủy.';
    this.redraw();
  }

  undoLastStroke(): void {
    if (!this.acceptedStrokes.length || this.isComplete) {
      return;
    }
    this.acceptedStrokes.pop();
    this.currentStrokeIndex = Math.max(0, this.currentStrokeIndex - 1);
    this.failedAttempts = 0;
    this.showHint = false;
    this.statusMessage = `Đã xóa nét. Viết lại nét ${this.currentStrokeIndex + 1}.`;
    this.redraw();
  }

  resetPad(): void {
    this.currentStrokeIndex = 0;
    this.failedAttempts = 0;
    this.acceptedStrokes = [];
    this.currentStroke = [];
    this.activePointerId = undefined;
    this.isComplete = false;
    this.showHint = false;
    this.showAnimation = true;
    this.statusMessage = 'Xem nét mẫu rồi viết theo đúng thứ tự.';
    this.redraw();
    this.startAnimationTimer();
  }

  replayAnimation(): void {
    this.showAnimation = false;
    clearTimeout(this.animationTimer);
    requestAnimationFrame(() => {
      this.showAnimation = true;
      this.startAnimationTimer();
    });
  }

  revealHint(): void {
    this.showAnimation = false;
    this.showHint = true;
    this.statusMessage = `Nét màu vàng là nét ${this.currentStrokeIndex + 1} cần viết.`;
  }

  skipCurrentStroke(): void {
    if (this.failedAttempts < 3 || this.isComplete) {
      return;
    }
    this.padSkipped.emit();
    this.statusMessage = 'Đã đánh dấu chữ này cần ôn lại.';
    this.isComplete = true;
    this.currentStroke = [];
    this.redraw();
  }

  private finishStroke(evaluation?: StrokeEvaluation): void {
    if (evaluation?.passed) {
      this.acceptedStrokes.push([...this.currentStroke]);
      this.currentStroke = [];
      this.currentStrokeIndex += 1;
      this.failedAttempts = 0;
      this.showHint = false;

      if (this.currentStrokeIndex >= this.strokeCount) {
        this.isComplete = true;
        this.statusMessage = 'Hoàn thành đúng thứ tự nét.';
        this.padCompleted.emit();
      } else {
        this.statusMessage = `Đúng rồi. Tiếp tục nét ${this.currentStrokeIndex + 1}/${this.strokeCount}.`;
      }
    } else {
      this.currentStroke = [];
      this.failedAttempts += 1;
      this.showHint = this.failedAttempts >= 2;
      this.statusMessage = this.failureMessage(evaluation);
    }
    this.redraw();
  }

  private failureMessage(evaluation?: StrokeEvaluation): string {
    if (!evaluation || evaluation.reason === 'too-short') {
      return 'Nét quá ngắn. Hãy viết liền mạch hơn.';
    }
    if (evaluation.reason === 'wrong-direction') {
      return 'Hãy bắt đầu và kết thúc theo hướng nét mẫu.';
    }
    return this.failedAttempts >= 3
      ? 'Nét chưa khớp. Bạn có thể xem gợi ý hoặc bỏ qua để ôn lại sau.'
      : 'Nét còn lệch mẫu. Hãy thử chậm hơn một chút.';
  }

  private toCanvasPoint(event: PointerEvent): StrokePoint {
    const canvas = this.canvasRef!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1024,
      y: ((event.clientY - rect.top) / rect.height) * 1024,
    };
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    this.redraw();
  }

  private redraw(): void {
    const canvas = this.canvasRef?.nativeElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(canvas.width / 1024, 0, 0, canvas.height / 1024, 0, 0);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    for (const stroke of this.acceptedStrokes) {
      this.drawPoints(context, stroke, '#173f85', 30);
    }
    if (this.currentStroke.length) {
      this.drawPoints(context, this.currentStroke, '#163a65', 30);
    }
  }

  private drawPoints(
    context: CanvasRenderingContext2D,
    points: readonly StrokePoint[],
    color: string,
    width: number,
  ): void {
    if (!points.length) {
      return;
    }
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) {
      context.lineTo(point.x, point.y);
    }
    context.strokeStyle = color;
    context.lineWidth = width;
    context.stroke();
  }

  private startAnimationTimer(): void {
    clearTimeout(this.animationTimer);
    this.animationTimer = this.zone.runOutsideAngular(() =>
      setTimeout(() => {
        this.zone.run(() => {
          if (!this.currentStroke.length) {
            this.showAnimation = false;
          }
        });
      }, Math.max(2400, this.strokeCount * 720 + 900)),
    );
  }
}
