import { TestBed } from '@angular/core/testing';
import { JapaneseSpeechService } from './japanese-speech.service';

describe('JapaneseSpeechService', () => {
  let service: JapaneseSpeechService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JapaneseSpeechService);
  });

  it('should prioritize a natural Japanese voice over a generic Japanese voice', () => {
    const genericVoice = {
      name: 'Japanese',
      lang: 'ja-JP',
      localService: true,
      default: true,
    } as SpeechSynthesisVoice;
    const naturalVoice = {
      name: 'Microsoft Nanami Online (Natural) - Japanese (Japan)',
      lang: 'ja-JP',
      localService: false,
      default: false,
    } as SpeechSynthesisVoice;
    const voiceScore = (voice: SpeechSynthesisVoice) =>
      (
        service as unknown as {
          voiceScore(candidate: SpeechSynthesisVoice): number;
        }
      ).voiceScore(voice);

    expect(voiceScore(naturalVoice)).toBeGreaterThan(voiceScore(genericVoice));
  });
});
