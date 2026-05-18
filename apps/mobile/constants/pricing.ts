/** Platform service fee (CHF) — snapshot on each booking per docs/data-model.md */
export const SERVICE_FEE_CHF = 1;

export function calculateBookingTotal(servicePriceChf: number): {
  serviceFeeChf: number;
  totalChf: number;
} {
  const serviceFeeChf = SERVICE_FEE_CHF;
  return {
    serviceFeeChf,
    totalChf: servicePriceChf + serviceFeeChf,
  };
}

export function formatChf(amount: number): string {
  return `CHF ${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}
