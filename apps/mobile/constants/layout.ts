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

/** Tailwind class helpers for shared layout rhythm. */
export const layoutClasses = {
  screenX: 'px-4',
  screenTop: 'pt-4',
  screenBottom: 'pb-8',
  sectionAfterCard: 'mt-9',
  sectionSpaced: 'mt-8',
  sectionBottom: 'mb-3',
  buttonGroup: 'gap-3',
  cardAfterSection: 'mb-0',
} as const;
