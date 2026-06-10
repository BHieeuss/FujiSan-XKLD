import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class JapaneseSpeechService {
  private readonly preferredVoicePatterns = [
    /nanami.*(?:natural|neural)/i,
    /keita.*(?:natural|neural)/i,
    /aoi.*(?:natural|neural)/i,
    /naoki.*(?:natural|neural)/i,
    /shiori.*(?:natural|neural)/i,
    /masaru.*(?:natural|neural)/i,
    /google.*(?:日本語|japanese)/i,
    /(?:kyoko|otoya|haruka|ayumi|ichiro|sayaka)/i,
    /(?:natural|neural|enhanced|premium)/i,
  ];

  get available(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string, rate = 0.86): void {
    if (!this.available) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = this.normalizedRate(rate);
    utterance.pitch = 1;
    utterance.voice = this.japaneseVoices()[0] ?? null;
    window.speechSynthesis.speak(utterance);
  }

  speakSequence(lines: readonly string[], rate = 0.84): void {
    if (!this.available) {
      return;
    }

    window.speechSynthesis.cancel();
    const voices = this.japaneseVoices();
    const dialogueVoices = voices.slice(0, 2);
    lines.forEach((line, index) => {
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.lang = 'ja-JP';
      utterance.rate = this.normalizedRate(rate);
      utterance.pitch = 1;
      utterance.voice =
        dialogueVoices[index % Math.max(dialogueVoices.length, 1)] ?? voices[0] ?? null;
      window.speechSynthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.available) {
      window.speechSynthesis.cancel();
    }
  }

  private japaneseVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang.toLowerCase().startsWith('ja'))
      .sort((first, second) => this.voiceScore(second) - this.voiceScore(first));
  }

  private voiceScore(voice: SpeechSynthesisVoice): number {
    const name = voice.name.toLowerCase();
    const preferredIndex = this.preferredVoicePatterns.findIndex((pattern) => pattern.test(name));
    let score = preferredIndex < 0 ? 0 : (this.preferredVoicePatterns.length - preferredIndex) * 20;

    if (voice.lang.toLowerCase() === 'ja-jp') {
      score += 40;
    }
    if (!voice.localService) {
      score += 10;
    }
    if (voice.default) {
      score += 2;
    }

    return score;
  }

  private normalizedRate(rate: number): number {
    return Math.min(Math.max(rate, 0.72), 0.92);
  }
}
