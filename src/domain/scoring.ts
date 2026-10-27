export type ScoredLook = {
  top: number;
  accessory: number;
  body: number;
  phrase: number;
};

export function calculateComboScore(look: ScoredLook): number {
  return Math.min(
    99,
    57 + look.top * 7 + look.accessory * 4 + look.body * 3 + look.phrase * 2,
  );
}
