/**
 * Layout spacing tokens — use matching Tailwind classes in components.
 * Keep in sync with SectionHeader, AppCard, AppInput and screen scroll padding.
 */
export const layout = {
  screenPaddingX: 16,
  screenPaddingTop: 16,
  screenPaddingBottom: 32,
  sectionLabelMarginTop: 32,
  sectionLabelMarginTopAfterCard: 36,
  sectionLabelMarginBottom: 12,
  cardToNextSection: 36,
  cardPadding: 16,
  rowVerticalPadding: 13,
  buttonGroupGap: 12,
  inputGroupGap: 16,
  inputHeight: 52,
  buttonHeightMain: 56,
} as const;

/** Tailwind class helpers — form/detail screens only (not home hero). */
export const layoutClasses = {
  screenX: 'px-4',
  screenTop: 'pt-4',
  screenBottom: 'pb-8',
  /** 32px — section label after a card (e.g. Termin buchen). */
  sectionAfterCard: 'mt-8',
  sectionSpaced: 'mt-8',
  /** 12px — space below section label before content. */
  sectionBottom: 'mb-3',
  buttonGroup: 'gap-3',
} as const;
