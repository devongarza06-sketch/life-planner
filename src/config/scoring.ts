/**
 * Scoring weight presets for different planning horizons.
 * IART+G = Impact, Alignment, Readiness, Time-sensitivity, Energy.
 */
export const scoringWeights = {
  annual: { impact: 0.4, alignment: 0.3, readiness: 0.1, time: 0.2 },
  quarterly: { impact: 0.25, alignment: 0.15, readiness: 0.35, time: 0.25 },
  independent: { impact: 0.3, alignment: 0.3, readiness: 0.25, time: 0.15 }
};

/** UIE = Urgency, Impact, Energy for Person tab */
export const uieWeights = { urgency: 0.4, impact: 0.4, energy: 0.2 };

/** JRN = Joy, Restoration, Novelty for Play tab */
export const jrnWeights = { joy: 0.4, restoration: 0.3, novelty: 0.3 };
