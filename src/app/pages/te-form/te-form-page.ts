import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  TeFormVerb,
  TE_FORM_VERBS,
  TE_FORM_RULES,
  GROUP_DESCRIPTIONS,
  HIRAGANA_KEYBOARD_ROWS,
  DAKUTEN_KEYBOARD_ROWS,
} from './te-form-data';

type ViewMode = 'practice' | 'theory';
type ExerciseType = 'multipleChoice' | 'wordBuilder' | 'virtualKeyboard';

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
  selector: 'app-te-form-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './te-form-page.html',
  styleUrl: './te-form-page.scss',
})
export class TeFormPage implements OnDestroy {
  // ── View state ────────────────────────────────────────────────────
  currentView: ViewMode = 'practice';
  exerciseType: ExerciseType = 'multipleChoice';
  currentVerb!: TeFormVerb;

  // ── Score & progress ──────────────────────────────────────────────
  score = 0;
  totalAnswered = 0;
  streak = 0;
  bestStreak = 0;

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

  // ── Virtual Keyboard ──────────────────────────────────────────────
  vkInput = '';
  vkKeyboardMode: 'hiragana' | 'dakuten' = 'hiragana';
  hiraganaRows = HIRAGANA_KEYBOARD_ROWS;
  dakutenRows = DAKUTEN_KEYBOARD_ROWS;

  // ── Header collapse ──────────────────────────────────────────────
  headerCollapsed = false;

  // ── Theory tab ────────────────────────────────────────────────────
  theoryActiveGroup: 1 | 2 | 3 = 1;

  // ── Audio context ─────────────────────────────────────────────────
  private audioCtx?: AudioContext;
  private speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  // ── Used verbs tracking (avoid immediate repeats) ─────────────────
  private recentVerbIds: string[] = [];
  private readonly RECENT_LIMIT = 10;

  // ── Animation timers ──────────────────────────────────────────────
  private feedbackTimer?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) {
    this.nextQuestion();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  toggleHeader(): void {
    this.headerCollapsed = !this.headerCollapsed;
  }

  ngOnDestroy(): void {
    clearTimeout(this.feedbackTimer);
    this.speechSynth?.cancel();
    this.audioCtx?.close();
  }

  // ══════════════════════════════════════════════════════════════════
  //  VIEW SWITCHING
  // ══════════════════════════════════════════════════════════════════

  switchView(view: ViewMode): void {
    this.currentView = view;
  }

  // ══════════════════════════════════════════════════════════════════
  //  QUESTION GENERATION
  // ══════════════════════════════════════════════════════════════════

  nextQuestion(): void {
    // Reset states
    this.isAnswered = false;
    this.isCorrect = false;
    this.showExplanation = false;
    this.mcSelectedIndex = -1;
    this.vkInput = '';
    this.vkKeyboardMode = 'hiragana';

    // Pick random verb (avoid recent ones)
    this.currentVerb = this.pickRandomVerb();

    // Pick random exercise type
    const types: ExerciseType[] = ['multipleChoice', 'wordBuilder', 'virtualKeyboard'];
    this.exerciseType = types[Math.floor(Math.random() * types.length)];

    // Setup exercise-specific data
    switch (this.exerciseType) {
      case 'multipleChoice':
        this.setupMultipleChoice();
        break;
      case 'wordBuilder':
        this.setupWordBuilder();
        break;
      case 'virtualKeyboard':
        // Nothing extra to set up
        break;
    }
  }

  private pickRandomVerb(): TeFormVerb {
    const available = TE_FORM_VERBS.filter((v) => !this.recentVerbIds.includes(v.id));
    const pool = available.length > 0 ? available : TE_FORM_VERBS;
    const verb = pool[Math.floor(Math.random() * pool.length)];

    this.recentVerbIds.push(verb.id);
    if (this.recentVerbIds.length > this.RECENT_LIMIT) {
      this.recentVerbIds.shift();
    }

    return verb;
  }

  // ── Multiple Choice Setup ─────────────────────────────────────────

  private setupMultipleChoice(): void {
    const correct = this.currentVerb.teForm;
    const wrongOptions = this.generateWrongOptions(this.currentVerb, 3);

    const options: MultipleChoiceOption[] = [
      { text: correct, isCorrect: true },
      ...wrongOptions.map((text) => ({ text, isCorrect: false })),
    ];

    // Shuffle options
    this.mcOptions = this.shuffleArray(options);
  }

  private generateWrongOptions(verb: TeFormVerb, count: number): string[] {
    const correct = verb.teForm;
    const stem = verb.hiragana.replace('ます', '');
    const wrongs = new Set<string>();

    // Strategy 1: Apply wrong rules to the same stem
    const wrongEndings = ['って', 'んで', 'いて', 'いで', 'して', 'て'];
    for (const ending of wrongEndings) {
      if (wrongs.size >= count) break;
      const stemBase = stem.slice(0, -1);
      const candidate = stemBase + ending;
      if (candidate !== correct && candidate.length >= 2) {
        wrongs.add(candidate);
      }
    }

    // Strategy 2: Pick te-forms from other verbs
    const otherVerbs = TE_FORM_VERBS.filter((v) => v.id !== verb.id);
    const shuffled = this.shuffleArray([...otherVerbs]);
    for (const other of shuffled) {
      if (wrongs.size >= count) break;
      if (other.teForm !== correct) {
        wrongs.add(other.teForm);
      }
    }

    return Array.from(wrongs).slice(0, count);
  }

  // ── Word Builder Setup ────────────────────────────────────────────

  private setupWordBuilder(): void {
    const correctChars = this.currentVerb.teForm.split('');
    // Give each correct char a low index (0..n)
    const correctTiles = correctChars.map((char, index) => ({ char, index }));

    // Add smart distractors — offset index by 1000 to distinguish from correct
    const distractorChars = this.generateWbDistractors(this.currentVerb);
    const distractorTiles = distractorChars.map((char, i) => ({ char, index: 1000 + i }));

    this.wbAvailableTiles = this.shuffleArray([...correctTiles, ...distractorTiles]);
    this.wbSelectedTiles = [];
  }

  /**
   * Generate distractor tiles that mimic wrong Te-form endings.
   * Strategy: pick chars from OTHER rule endings that are NOT in the correct answer,
   * so learners who guess randomly will likely get it wrong.
   */
  private generateWbDistractors(verb: TeFormVerb): string[] {
    const teForm = verb.teForm;
    const distractors: string[] = [];

    // Confusion chars per Te-form ending
    if (teForm.endsWith('って')) {
      // Confuse with んで / いて ending chars
      distractors.push('ん', 'で', 'い', 'じ');
    } else if (teForm.endsWith('んで')) {
      // Confuse with って / いて ending chars
      distractors.push('っ', 'て', 'い', 'き');
    } else if (teForm.endsWith('いて')) {
      // Confuse with いで / って ending chars
      distractors.push('で', 'っ', 'ん', 'ぎ');
    } else if (teForm.endsWith('いで')) {
      // Confuse with いて / んで ending chars
      distractors.push('て', 'っ', 'ん', 'き');
    } else if (teForm.endsWith('して')) {
      // Confuse with じて / んで ending chars
      distractors.push('じ', 'で', 'っ', 'ん');
    } else if (teForm.endsWith('きて')) {
      // Group 3 くる
      distractors.push('し', 'っ', 'ん', 'で');
    } else {
      // Group 2 / group 3 (ends with て or して)
      distractors.push('っ', 'で', 'ん', 'い');
    }

    // Filter out chars already in correct answer to avoid duplicate confusion
    const correctSet = new Set(verb.teForm.split(''));
    return distractors.filter((c) => !correctSet.has(c)).slice(0, 4);
  }

  // ══════════════════════════════════════════════════════════════════
  //  USER INTERACTIONS
  // ══════════════════════════════════════════════════════════════════

  // ── Multiple Choice ───────────────────────────────────────────────

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

  // ── Word Builder ──────────────────────────────────────────────────

  selectWbTile(tile: { char: string; index: number }): void {
    if (this.isAnswered) return;

    this.wbAvailableTiles = this.wbAvailableTiles.filter((t) => t !== tile);
    this.wbSelectedTiles.push(tile);

    // Auto-check when user has selected exactly as many tiles as the correct answer
    if (this.wbSelectedTiles.length === this.currentVerb.teForm.length) {
      const answer = this.wbSelectedTiles.map((t) => t.char).join('');
      this.processAnswer(answer === this.currentVerb.teForm);
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

  get wbCurrentAnswer(): string {
    return this.wbSelectedTiles.map((t) => t.char).join('');
  }

  // ── Virtual Keyboard ──────────────────────────────────────────────

  vkTypeChar(char: string): void {
    if (this.isAnswered || !char) return;
    this.vkInput += char;
  }

  vkBackspace(): void {
    if (this.isAnswered) return;
    this.vkInput = this.vkInput.slice(0, -1);
  }

  vkClear(): void {
    if (this.isAnswered) return;
    this.vkInput = '';
  }

  vkSubmit(): void {
    if (this.isAnswered || !this.vkInput) return;
    this.processAnswer(this.vkInput === this.currentVerb.teForm);
  }

  toggleKeyboardMode(): void {
    this.vkKeyboardMode = this.vkKeyboardMode === 'hiragana' ? 'dakuten' : 'hiragana';
  }

  get currentKeyboardRows(): string[][] {
    return this.vkKeyboardMode === 'hiragana' ? this.hiraganaRows : this.dakutenRows;
  }

  // ══════════════════════════════════════════════════════════════════
  //  ANSWER PROCESSING & FEEDBACK
  // ══════════════════════════════════════════════════════════════════

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
      this.speakJapanese(this.currentVerb.teForm);
    } else {
      this.streak = 0;
      this.playWrongSound();
      this.showExplanation = true;
    }

    // Auto-collapse header after first answer
    if (this.totalAnswered === 1) {
      setTimeout(() => {
        this.headerCollapsed = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 600);
    }
  }

  closeExplanation(): void {
    this.showExplanation = false;
  }

  // ══════════════════════════════════════════════════════════════════
  //  AUDIO & SPEECH
  // ══════════════════════════════════════════════════════════════════

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  private playCorrectSound(): void {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      // Pleasant ascending chord
      osc.frequency.setValueAtTime(523, ctx.currentTime);        // C5
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);  // E5
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);  // G5

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not available
    }
  }

  private playWrongSound(): void {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      // Gentle descending tone
      osc.frequency.setValueAtTime(330, ctx.currentTime);       // E4
      osc.frequency.setValueAtTime(262, ctx.currentTime + 0.15); // C4

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio not available
    }
  }

  speakJapanese(text: string): void {
    if (!this.speechSynth) return;

    this.speechSynth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;

    // Try to find a Japanese voice
    const voices = this.speechSynth.getVoices();
    const jaVoice = voices.find((v) => v.lang.startsWith('ja'));
    if (jaVoice) {
      utterance.voice = jaVoice;
    }

    this.speechSynth.speak(utterance);
  }

  speakVietnamese(text: string): void {
    if (!this.speechSynth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;
    utterance.volume = 0.9;

    this.speechSynth.speak(utterance);
  }

  // ══════════════════════════════════════════════════════════════════
  //  HELPERS & GETTERS
  // ══════════════════════════════════════════════════════════════════

  get accuracy(): number {
    if (this.totalAnswered === 0) return 0;
    return Math.round((this.score / this.totalAnswered) * 100);
  }

  get exerciseTypeLabel(): string {
    switch (this.exerciseType) {
      case 'multipleChoice': return 'Trắc nghiệm';
      case 'wordBuilder': return 'Ghép từ';
      case 'virtualKeyboard': return 'Gõ phím';
    }
  }

  get exerciseTypeIcon(): string {
    switch (this.exerciseType) {
      case 'multipleChoice': return 'fas fa-list-check';
      case 'wordBuilder': return 'fas fa-puzzle-piece';
      case 'virtualKeyboard': return 'fas fa-keyboard';
    }
  }

  getRuleDescription(ruleKey: string): string {
    return TE_FORM_RULES[ruleKey] ?? '';
  }

  getGroupDescription(group: number): string {
    return GROUP_DESCRIPTIONS[group] ?? '';
  }

  getGroupLabel(group: number): string {
    switch (group) {
      case 1: return 'Nhóm I (五段)';
      case 2: return 'Nhóm II (一段)';
      case 3: return 'Nhóm III (不規則)';
      default: return '';
    }
  }

  /** Builds rich pedagogical explanation for current verb */
  get explanationData(): ExplanationData {
    const v = this.currentVerb;
    const masu = v.hiragana; // e.g. とります
    const stem = masu.replace('ます', ''); // e.g. とり
    const endChar = stem.slice(-1); // e.g. り

    if (v.group === 3) {
      const isSuru = v.rule === 'g3_suru';
      return {
        verbIntro: `「${masu}」là động từ Nhóm 3 (不規則 — bất quy tắc).`,
        formula: isSuru
          ? 'Động từ Nhóm 3:  します → して'
          : 'Động từ Nhóm 3:  きます → きて',
        steps: [
          { label: 'Dạng ます', value: masu },
          { label: 'Thể て', value: v.teForm, highlight: true },
        ],
        note: isSuru
          ? 'Tất cả động từ ghép với します cũng chia tương tự: べんきょうします → べんきょうして'
          : '来ます (きます) là 1 trong 2 động từ bất quy tắc duy nhất.',
        quickRef: [
          { pattern: 'します', result: 'して', example: 'します → して' },
          { pattern: 'きます', result: 'きて', example: 'きます → きて' },
        ],
      };
    }

    if (v.group === 2) {
      return {
        verbIntro: `「${masu}」là động từ Nhóm 2 (一段 — ichidan).`,
        formula: 'Động từ Nhóm 2: Bỏ「ます」, thêm「て」— đơn giản nhất!',
        steps: [
          { label: 'Dạng ます', value: masu },
          { label: 'Bỏ ます', value: stem + ' + て' },
          { label: 'Thể て', value: v.teForm, highlight: true },
        ],
        note: 'Nhóm 2 luôn chỉ có một quy tắc duy nhất: bỏ ます, thêm て.',
        quickRef: [
          { pattern: 'ます', result: 'て', example: `${masu} → ${v.teForm}` },
        ],
      };
    }

    // Group 1 — determine rule by endChar
    const endMap: Record<string, { romanji: string; formula: string; result: string; steps: string }> = {
      'い': { romanji: 'i', formula: 'い, ち, り  ➔  って (tte)', result: 'って', steps: `Bỏ「い」, thêm「って」` },
      'ち': { romanji: 'chi', formula: 'い, ち, り  ➔  って (tte)', result: 'って', steps: `Bỏ「ち」, thêm「って」` },
      'り': { romanji: 'ri', formula: 'い, ち, り  ➔  って (tte)', result: 'って', steps: `Bỏ「り」, thêm「って」` },
      'み': { romanji: 'mi', formula: 'み, に, び  ➔  んで (nde)', result: 'んで', steps: `Bỏ「み」, thêm「んで」` },
      'に': { romanji: 'ni', formula: 'み, に, び  ➔  んで (nde)', result: 'んで', steps: `Bỏ「に」, thêm「んで」` },
      'び': { romanji: 'bi', formula: 'み, に, び  ➔  んで (nde)', result: 'んで', steps: `Bỏ「び」, thêm「んで」` },
      'き': { romanji: 'ki', formula: 'き  ➔  いて (ite)', result: 'いて', steps: `Bỏ「き」, thêm「いて」` },
      'ぎ': { romanji: 'gi', formula: 'ぎ  ➔  いで (ide)', result: 'いで', steps: `Bỏ「ぎ」, thêm「いで」` },
      'し': { romanji: 'shi', formula: 'し  ➔  して (shite)', result: 'して', steps: `Giữ「し」, thêm「て」` },
    };

    const rule = endMap[endChar] ?? { romanji: '?', formula: '—', result: v.teForm, steps: '—' };
    const isException = v.rule === 'g1_exception';
    const stemBase = stem.slice(0, -1); // stem without the last char

    return {
      verbIntro: `「${masu}」là động từ Nhóm 1, chữ cái đứng trước「ます」là「${endChar}」(${rule.romanji}).`,
      formula: `Công thức: Động từ Nhóm 1 có âm trước「ます」là ${rule.formula}`,
      steps: [
        { label: 'Dạng ます', value: masu },
        { label: 'Áp dụng', value: `${stemBase} + ${rule.result}` },
        { label: 'Thể て', value: v.teForm, highlight: true },
      ],
      note: isException
        ? '⚠️ Ngoại lệ: いきます → いって (không theo quy tắc き → いて)'
        : null,
      quickRef: [
        { pattern: 'い・ち・り', result: 'って', example: 'かいます → かって' },
        { pattern: 'み・に・び', result: 'んで', example: 'のみます → のんで' },
        { pattern: 'き', result: 'いて', example: 'かきます → かいて' },
        { pattern: 'ぎ', result: 'いで', example: 'およぎます → およいで' },
        { pattern: 'し', result: 'して', example: 'はなします → はなして' },
      ],
      activePattern: rule.result,
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

  // ── Theory section data ───────────────────────────────────────────

  get group1TteVerbs(): TeFormVerb[] {
    return TE_FORM_VERBS.filter((v) => v.rule === 'g1_tte').slice(0, 6);
  }
  get group1NdeVerbs(): TeFormVerb[] {
    return TE_FORM_VERBS.filter((v) => v.rule === 'g1_nde').slice(0, 4);
  }
  get group1IteVerbs(): TeFormVerb[] {
    return TE_FORM_VERBS.filter((v) => v.rule === 'g1_ite').slice(0, 4);
  }
  get group1IdeVerbs(): TeFormVerb[] {
    return TE_FORM_VERBS.filter((v) => v.rule === 'g1_ide');
  }
  get group1ShiteVerbs(): TeFormVerb[] {
    return TE_FORM_VERBS.filter((v) => v.rule === 'g1_shite').slice(0, 4);
  }
  get group1ExceptionVerbs(): TeFormVerb[] {
    return TE_FORM_VERBS.filter((v) => v.rule === 'g1_exception');
  }
  get group2Verbs(): TeFormVerb[] {
    return TE_FORM_VERBS.filter((v) => v.group === 2).slice(0, 8);
  }
  get group3Verbs(): TeFormVerb[] {
    return TE_FORM_VERBS.filter((v) => v.group === 3).slice(0, 8);
  }
}
