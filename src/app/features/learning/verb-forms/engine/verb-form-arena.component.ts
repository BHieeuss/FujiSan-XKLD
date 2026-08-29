import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  VerbFormConfig,
  ConjugationVerb,
  ALL_VERB_FORM_LINKS,
  VerbFormQuickLink,
} from './verb-form-arena.models';
import { JapaneseAudioService } from '../../services/japanese-audio.service';

type ViewMode = 'practice' | 'theory';
type ExerciseType = 'multipleChoice' | 'wordBuilder';

interface MultipleChoiceOption {
  text: string;
  isCorrect: boolean;
}

interface ExplanationStep {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ExplanationData {
  verbIntro: string;
  formula: string;
  steps: ExplanationStep[];
  note: string | null;
  quickRef: { pattern: string; result: string; example: string }[];
  activePattern?: string;
}

@Component({
  selector: 'app-verb-form-arena',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verb-form-arena.component.html',
  styleUrl: './verb-form-arena.component.scss',
})
export class VerbFormArenaComponent implements OnInit, OnDestroy {
  @Input({ required: true }) config!: VerbFormConfig;

  private readonly router = inject(Router);
  private readonly audioService = inject(JapaneseAudioService);

  // ── View state (Defaults to Theory!) ──────────────────────────────
  currentView: ViewMode = 'theory';

  // ── Audio prompt ──────────────────────────────────────────────────
  audioUnlocked = false;
  showAudioPrompt = false;
  audioPromptError = '';

  // ── Score & Stats ─────────────────────────────────────────────────
  score = 0;
  totalAnswered = 0;
  streak = 0;
  bestStreak = 0;

  // ── Current Exercise ──────────────────────────────────────────────
  currentVerb!: ConjugationVerb;
  exerciseType: ExerciseType = 'multipleChoice';

  // ── Answer state ──────────────────────────────────────────────────
  isAnswered = false;
  isCorrect = false;
  showExplanation = false;

  // ── Multiple Choice ───────────────────────────────────────────────
  mcOptions: MultipleChoiceOption[] = [];
  mcSelectedIndex = -1;

  // ── Word Builder ──────────────────────────────────────────────────
  wbAvailableTiles: { char: string; index: number }[] = [];
  wbSelectedTiles: { char: string; index: number }[] = [];


  // ── Header collapse ──────────────────────────────────────────────
  headerCollapsed = false;

  // ── Quick Form Switcher ───────────────────────────────────────────
  isSwitcherOpen = false;
  readonly allForms: VerbFormQuickLink[] = ALL_VERB_FORM_LINKS;
  readonly n5Forms: VerbFormQuickLink[] = ALL_VERB_FORM_LINKS.filter((f) => f.level === 'N5');
  readonly n4Forms: VerbFormQuickLink[] = ALL_VERB_FORM_LINKS.filter((f) => f.level === 'N4');

  // ── Theory tab ────────────────────────────────────────────────────
  theoryActiveGroup: 1 | 2 | 3 = 1;

  // ── Used verbs tracking ───────────────────────────────────────────
  private recentVerbIds: string[] = [];
  private readonly RECENT_LIMIT = 10;

  ngOnInit(): void {
    this.initAudioReminder();
    if (this.config && this.config.verbs.length > 0) {
      this.currentVerb = this.config.verbs[0];
      this.nextQuestion();
    }
  }

  ngOnDestroy(): void {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target && !target.closest('.te-form-switcher')) {
      this.isSwitcherOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.isSwitcherOpen = false;
  }

  toggleSwitcher(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isSwitcherOpen = !this.isSwitcherOpen;
  }

  closeSwitcher(): void {
    this.isSwitcherOpen = false;
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  toggleHeader(): void {
    this.headerCollapsed = !this.headerCollapsed;
  }

  openAudioPrompt(): void {
    this.audioPromptError = '';
    this.showAudioPrompt = true;
  }

  closeAudioPrompt(): void {
    this.showAudioPrompt = false;
  }

  async enableAudioSupport(): Promise<void> {
    this.audioPromptError = '';
    const success = await this.audioService.unlockAudio();
    if (success) {
      this.audioUnlocked = true;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`audioUnlocked_${this.config?.formId || 'verb'}`, '1');
      }
      this.showAudioPrompt = false;
      this.playCorrectSound();
      if (this.config?.audioKeyword) {
        this.speakJapanese(this.config.audioKeyword);
      }
    } else {
      this.audioPromptError =
        'Không thể bật âm thanh tự động. Hãy mở tiếng trên điện thoại rồi thử lại.';
    }
  }

  speakJapanese(text: string): void {
    void this.audioService.speak(text);
  }

  playCorrectSound(): void {
    this.audioService.playCorrectSound();
  }

  playWrongSound(): void {
    this.audioService.playWrongSound();
  }

  private initAudioReminder(): void {
    if (typeof window === 'undefined') return;

    const key = `audioUnlocked_${this.config?.formId || 'verb'}`;
    const saved = window.localStorage.getItem(key) || window.localStorage.getItem('teFormAudioUnlocked');
    if (saved === '1') {
      this.audioUnlocked = true;
      return;
    }

    this.showAudioPrompt = true;
  }

  // ══════════════════════════════════════════════════════════════════
  //  VIEW SWITCHING
  // ══════════════════════════════════════════════════════════════

  switchView(view: ViewMode): void {
    this.currentView = view;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  QUESTION GENERATION
  // ══════════════════════════════════════════════════════════════

  nextQuestion(): void {
    this.isAnswered = false;
    this.isCorrect = false;
    this.showExplanation = false;
    this.mcSelectedIndex = -1;

    this.currentVerb = this.pickRandomVerb();

    const types: ExerciseType[] = ['multipleChoice', 'wordBuilder'];
    this.exerciseType = types[Math.floor(Math.random() * types.length)];

    switch (this.exerciseType) {
      case 'multipleChoice':
        this.setupMultipleChoice();
        break;
      case 'wordBuilder':
        this.setupWordBuilder();
        break;
    }
  }

  private pickRandomVerb(): ConjugationVerb {
    const verbs = this.config.verbs;
    const available = verbs.filter((v) => !this.recentVerbIds.includes(v.id));
    const pool = available.length > 0 ? available : verbs;
    const verb = pool[Math.floor(Math.random() * pool.length)];

    this.recentVerbIds.push(verb.id);
    if (this.recentVerbIds.length > this.RECENT_LIMIT) {
      this.recentVerbIds.shift();
    }

    return verb;
  }

  // ── Multiple Choice Setup ──────────────────────────────────────────

  private setupMultipleChoice(): void {
    const correct = this.currentVerb.targetForm;
    const distractors = this.generateMcDistractors(this.currentVerb, 3);
    const allOptions = [
      { text: correct, isCorrect: true },
      ...distractors.map((d) => ({ text: d, isCorrect: false })),
    ];

    this.mcOptions = this.shuffleArray(allOptions);
  }

  private generateMcDistractors(verb: ConjugationVerb, count: number): string[] {
    const correct = verb.targetForm;
    const wrongs = new Set<string>();
    const stem = verb.hiragana.replace('ます', '');

    // Heuristic distractors depending on formId
    if (this.config.formId === 'te') {
      wrongs.add(stem + 'んで');
      wrongs.add(stem + 'って');
      wrongs.add(stem + 'いて');
    } else if (this.config.formId === 'ta') {
      wrongs.add(stem + 'んだ');
      wrongs.add(stem + 'った');
      wrongs.add(stem + 'いた');
    } else if (this.config.formId === 'nai') {
      wrongs.add(stem + 'ない');
      wrongs.add(stem.slice(0, -1) + 'あない');
    } else if (this.config.formId === 'ru') {
      wrongs.add(stem + 'る');
      wrongs.add(stem.slice(0, -1) + 'あ');
    } else if (this.config.formId === 'volitional') {
      wrongs.add(stem + 'よう');
      if (correct.endsWith('う') && correct.length > 2) {
        wrongs.add(correct.slice(0, -1));
      }
    } else if (this.config.formId === 'imperative') {
      wrongs.add(stem + 'ろ');
      wrongs.add(stem + 'え');
      wrongs.add(stem + 'な');
    } else if (this.config.formId === 'prohibitive') {
      wrongs.add(stem + 'な');
      wrongs.add(stem + 'るな');
      wrongs.add(stem.slice(0, -1) + 'えな');
    } else if (this.config.formId === 'potential') {
      wrongs.add(stem + 'られる');
      wrongs.add(stem + 'れる');
      wrongs.add(stem.slice(0, -1) + 'ある');
    } else if (this.config.formId === 'conditional') {
      wrongs.add(stem + 'れば');
      wrongs.add(stem + 'ば');
      wrongs.add(stem.slice(0, -1) + 'あば');
    } else if (this.config.formId === 'passive') {
      wrongs.add(stem + 'れる');
      wrongs.add(stem + 'られる');
      wrongs.add(stem.slice(0, -1) + 'える');
    } else if (this.config.formId === 'causative') {
      wrongs.add(stem + 'せる');
      wrongs.add(stem + 'させる');
      wrongs.add(stem.slice(0, -1) + 'あせる');
    } else if (this.config.formId === 'causative-passive') {
      wrongs.add(stem + 'される');
      wrongs.add(stem + 'させられる');
      wrongs.add(stem.slice(0, -1) + 'あされる');
    }

    wrongs.delete(correct);

    const shuffled = this.shuffleArray(this.config.verbs);
    for (const other of shuffled) {
      if (wrongs.size >= count) break;
      if (other.targetForm !== correct) {
        wrongs.add(other.targetForm);
      }
    }

    return Array.from(wrongs).slice(0, count);
  }

  // ── Word Builder Setup ────────────────────────────────────────────

  private setupWordBuilder(): void {
    const correctChars = this.currentVerb.targetForm.split('');
    const correctTiles = correctChars.map((char, index) => ({ char, index }));

    const distractorChars = this.generateWbDistractors(this.currentVerb);
    const distractorTiles = distractorChars.map((char, i) => ({ char, index: 1000 + i }));

    this.wbAvailableTiles = this.shuffleArray([...correctTiles, ...distractorTiles]);
    this.wbSelectedTiles = [];
  }

  private generateWbDistractors(verb: ConjugationVerb): string[] {
    const target = verb.targetForm;
    const candidates = ['っ', 'ん', 'て', 'で', 'た', 'だ', 'い', 'き', 'ぎ', 'し', 'よ', 'う', 'る', 'な', 'わ'];
    const correctSet = new Set(target.split(''));
    const pool = candidates.filter((c) => !correctSet.has(c));
    return this.shuffleArray(pool).slice(0, 4);
  }

  // ══════════════════════════════════════════════════════════════════
  //  USER INTERACTIONS
  // ══════════════════════════════════════════════════════════════

  selectMcOption(index: number): void {
    if (this.isAnswered) return;

    this.mcSelectedIndex = index;
    const option = this.mcOptions[index];
    this.processAnswer(option.isCorrect);
  }

  getMcOptionClass(index: number): string {
    if (!this.isAnswered) {
      return '';
    }
    if (this.mcOptions[index].isCorrect) {
      return 'correct';
    }
    if (index === this.mcSelectedIndex && !this.mcOptions[index].isCorrect) {
      return 'wrong';
    }
    return 'dimmed';
  }

  selectWbTile(tile: { char: string; index: number }): void {
    if (this.isAnswered) return;

    this.wbAvailableTiles = this.wbAvailableTiles.filter((t) => t !== tile);
    this.wbSelectedTiles.push(tile);

    if (this.wbSelectedTiles.length === this.currentVerb.targetForm.length) {
      const answer = this.wbSelectedTiles.map((t) => t.char).join('');
      this.processAnswer(answer === this.currentVerb.targetForm);
    }
  }

  unselectWbTile(tile: { char: string; index: number }): void {
    if (this.isAnswered) return;

    this.wbSelectedTiles = this.wbSelectedTiles.filter((t) => t !== tile);
    this.wbAvailableTiles.push(tile);
  }

  resetWordBuilder(): void {
    if (this.isAnswered) return;
    this.setupWordBuilder();
  }


  // ══════════════════════════════════════════════════════════════════
  //  ANSWER PROCESSING & FEEDBACK
  // ══════════════════════════════════════════════════════════════

  private processAnswer(correct: boolean): void {
    this.isAnswered = true;
    this.isCorrect = correct;
    this.totalAnswered++;

    if (correct) {
      this.score++;
      this.streak++;
      if (this.streak > this.bestStreak) {
        this.bestStreak = this.streak;
      }
      this.playCorrectSound();
      this.speakJapanese(this.currentVerb.targetForm);
    } else {
      this.streak = 0;
      this.playWrongSound();
      this.showExplanation = true;
    }

    // Auto-collapse header after first answer
    if (this.totalAnswered === 1) {
      setTimeout(() => {
        this.headerCollapsed = true;
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 600);
    }
  }

  closeExplanation(): void {
    this.showExplanation = false;
  }

  get accuracy(): number {
    if (this.totalAnswered === 0) return 0;
    return Math.round((this.score / this.totalAnswered) * 100);
  }

  get exerciseTypeLabel(): string {
    switch (this.exerciseType) {
      case 'multipleChoice':
        return 'Trắc nghiệm phản xạ';
      case 'wordBuilder':
        return 'Ghép từ';
    }
  }

  get exerciseTypeIcon(): string {
    switch (this.exerciseType) {
      case 'multipleChoice':
        return 'fas fa-hand-pointer';
      case 'wordBuilder':
        return 'fas fa-puzzle-piece';
    }
  }

  get explanationData(): ExplanationData {
    const v = this.currentVerb;
    const masu = v.hiragana;
    const stem = masu.replace('ます', '');
    const endChar = stem.slice(-1);
    const formId = this.config.formId;

    if (v.group === 3) {
      const isSuru = masu.endsWith('します');
      const isKuru = v.id === 'kuru' || masu === 'きます';
      return {
        verbIntro: `「${masu}」là động từ Nhóm 3 (不規則 — bất quy tắc).`,
        formula: isSuru ? `Động từ Nhóm 3: します → ${v.targetForm}` : `Động từ Nhóm 3: きます → ${v.targetForm}`,
        steps: [
          { label: 'Dạng ます', value: masu },
          { label: this.config.title, value: v.targetForm, highlight: true },
        ],
        note: isKuru ? '⚠️ Chú ý: Động từ 来ます (きます) có cách biến đổi đặc biệt.' : null,
        quickRef: [
          { pattern: 'します', result: isSuru ? v.targetForm : '...', example: `${masu} → ${v.targetForm}` },
          { pattern: 'きます', result: isKuru ? v.targetForm : '...', example: `きます → ${v.targetForm}` },
        ],
      };
    }

    if (v.group === 2) {
      return {
        verbIntro: `「${masu}」là động từ Nhóm 2 (一段 — ichidan).`,
        formula: `Động từ Nhóm 2: Bỏ「ます」+ Đuôi thể mục tiêu`,
        steps: [
          { label: 'Dạng ます', value: masu },
          { label: 'Bỏ ます', value: stem },
          { label: this.config.title, value: v.targetForm, highlight: true },
        ],
        note: 'Nhóm 2: chỉ cần bỏ ます và thay trực tiếp bằng đuôi tương ứng.',
        quickRef: [{ pattern: 'ます', result: v.targetForm, example: `${masu} → ${v.targetForm}` }],
      };
    }

    // Nhóm 1
    return {
      verbIntro: `「${masu}」là động từ Nhóm 1, âm trước「ます」là「${endChar}」(cột い).`,
      formula: `Biến đổi âm cuối「${endChar}」theo quy tắc của nhóm 1`,
      steps: [
        { label: 'Dạng ます', value: masu },
        { label: 'Bỏ ます', value: stem },
        { label: this.config.title, value: v.targetForm, highlight: true },
      ],
      note: null,
      quickRef: [
        { pattern: 'い・ち・り', result: formId === 'te' ? 'って' : formId === 'ta' ? 'った' : '...', example: `${masu} → ${v.targetForm}` },
      ],
      activePattern: v.targetForm,
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
