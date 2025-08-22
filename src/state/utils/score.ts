export type ScoreInputs =
  | { rubric: "IART+G"; I?: number; A?: number; R?: number; T?: number; G?: number }
  | { rubric: "JRN"; J?: number; R?: number; N?: number }
  | { rubric: "UIE"; U?: number; I?: number; E?: number };

export function scoreFromInputs(inputs?: ScoreInputs): number | undefined {
  if (!inputs) return undefined;
  if (inputs.rubric === "IART+G") {
    const { I, A, R, T } = inputs;
    const vals = [I, A, R, T].filter((v): v is number => typeof v === "number");
    return vals.length === 4 ? Math.round((vals.reduce((a, b) => a + b, 0) / 4) * 10) / 10 : undefined;
  }
  if (inputs.rubric === "JRN") {
    const { J, R, N } = inputs;
    const vals = [J, R, N].filter((v): v is number => typeof v === "number");
    return vals.length === 3 ? Math.round((vals.reduce((a, b) => a + b, 0) / 3) * 10) / 10 : undefined;
  }
  if (inputs.rubric === "UIE") {
    const { U, I, E } = inputs;
    const vals = [U, I, E].filter((v): v is number => typeof v === "number");
    return vals.length === 3 ? Math.round((vals.reduce((a, b) => a + b, 0) / 3) * 10) / 10 : undefined;
  }
  return undefined;
}
