import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JapaneseAudioService {
  private readonly audioCache = new Map<string, HTMLAudioElement>();
  private audioCtx?: AudioContext;
  private currentAudio?: HTMLAudioElement;
  private isUnlocked = false;

  constructor() {
    this.initAudio();
  }

  private initAudio(): void {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('viejap.audio-unlocked');
      if (saved === '1') {
        this.isUnlocked = true;
      }
    }
  }

  getAudioContext(): AudioContext {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    return this.audioCtx!;
  }

  async unlockAudio(): Promise<boolean> {
    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      this.isUnlocked = ctx.state === 'running';
      if (this.isUnlocked && typeof window !== 'undefined') {
        window.localStorage.setItem('viejap.audio-unlocked', '1');
      }
      return this.isUnlocked;
    } catch {
      return false;
    }
  }

  /**
   * Phát âm thanh chuẩn tiếng Nhật qua Online TTS Engine
   * Tự động cache âm thanh và fallback sang SpeechSynthesis nếu không có mạng
   */
  speak(text: string, rate = 0.9): Promise<void> {
    if (!text || typeof window === 'undefined') {
      return Promise.resolve();
    }

    const cleanText = text.trim();
    if (!cleanText) {
      return Promise.resolve();
    }

    // Stop currently playing audio
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Ignore
      }
    }

    return new Promise((resolve) => {
      // 1. Kiểm tra cache
      let audio = this.audioCache.get(cleanText);

      if (!audio) {
        // 2. Tạo URL online TTS chuẩn Nhật Bản
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
        audio = new Audio(ttsUrl);
        audio.preload = 'auto';
        this.audioCache.set(cleanText, audio);
      }

      audio.playbackRate = rate;
      this.currentAudio = audio;

      const onEnded = () => {
        audio?.removeEventListener('ended', onEnded);
        audio?.removeEventListener('error', onError);
        resolve();
      };

      const onError = () => {
        audio?.removeEventListener('ended', onEnded);
        audio?.removeEventListener('error', onError);
        // Fallback sang SpeechSynthesis trên thiết bị
        this.speakFallbackSpeech(cleanText, rate);
        resolve();
      };

      audio.addEventListener('ended', onEnded, { once: true });
      audio.addEventListener('error', onError, { once: true });

      // Phát audio
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Trình duyệt chặn autoplay hoặc lỗi mạng -> fallback
          this.speakFallbackSpeech(cleanText, rate);
          resolve();
        });
      }
    });
  }

  /**
   * Fallback Web Speech Synthesis
   */
  private speakFallbackSpeech(text: string, rate = 0.9): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = rate;

      // Ưu tiên chọn voice tiếng Nhật tốt nhất trên máy
      const voices = window.speechSynthesis.getVoices();
      const jaVoice =
        voices.find((v) => v.lang.startsWith('ja') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Kyoko') || v.name.includes('Otoya'))) ||
        voices.find((v) => v.lang.startsWith('ja'));
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore
    }
  }

  /**
   * Chuông báo đáp án đúng (Cheerful Chime)
   */
  playCorrectSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore
    }
  }

  /**
   * Chuông báo đáp án chưa đúng (Soft Low Tone)
   */
  playWrongSound(): void {
    try {
      const ctx = this.getAudioContext();
      if (ctx.state !== 'running') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // Ignore
    }
  }
}
