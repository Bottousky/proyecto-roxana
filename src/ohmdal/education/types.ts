export const EDUCATION_CARD_FIELDS = [
  'identifierVersion',
  'technicalName',
  'competencyLevel',
  'sources',
  'reviewerDate',
  'prerequisites',
  'observableObjective',
  'technicalModel',
  'variablesUnits',
  'assumptionsLimits',
  'safetyRisks',
  'initialPhenomenon',
  'researchQuestion',
  'expectedHypotheses',
  'availableInstruments',
  'allowedInteractions',
  'simulatedConsequences',
  'productiveErrors',
  'evidenceHints',
  'masteryCriteria',
  'transfer',
  'diegeticMetaphor',
  'metaphorLimit',
  'localFormalVocabulary',
  'initialLogEntry',
  'revisedLogEntry',
  'accessibility',
  'allowedTelemetry',
  'deterministicTest',
  'validationStatus',
] as const;

export type EducationCardField = (typeof EDUCATION_CARD_FIELDS)[number];
export type EducationCard = Readonly<Record<EducationCardField, string>>;

export function defineEducationCard(card: EducationCard): EducationCard {
  return Object.freeze({ ...card });
}
