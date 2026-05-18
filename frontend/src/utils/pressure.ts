export const PSI_TO_BAR = 0.0689476;

export function psiToBar(psi: number): number {
  return Math.round(psi * PSI_TO_BAR * 100) / 100;
}

export function formatBar(value: number): string {
  return value.toFixed(2);
}
