import { describe, expect, it } from 'vitest';
import { calculateComboScore } from './scoring';

describe('calculateComboScore', () => {
  it('uses only gameplay-scored selections', () => {
    expect(calculateComboScore({ top: 0, accessory: 0, body: 1, phrase: 0 })).toBe(60);
    expect(calculateComboScore({ top: 3, accessory: 3, body: 2, phrase: 3 })).toBe(99);
  });

  it('keeps every cosmetic combination outside the scoring contract', () => {
    const scoredLook = { top: 2, accessory: 1, body: 0, phrase: 3 } as const;
    const expectedScore = calculateComboScore(scoredLook);

    for (let hair = 0; hair < 6; hair += 1) {
      for (let headwear = 0; headwear < 3; headwear += 1) {
        for (let audio = 0; audio < 3; audio += 1) {
          const cosmeticLook = { ...scoredLook, hair, headwear, audio };
          expect(calculateComboScore(cosmeticLook)).toBe(expectedScore);
        }
      }
    }
  });
});
