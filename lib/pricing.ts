// Pricing rules. Pure functions, no React. All money is integer cents.

export type PlanId = "pro" | "team";

export type PlanConfig = {
  id: PlanId;
  unitPriceCents: number; // per seat per month
  minSeats: number;
  maxSeats: number;
  // Seats strictly over `over` get `rate` (a fraction, 0.05 = 5%) off the subtotal.
  volume?: { over: number; rate: number };
};

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  pro: { id: "pro", unitPriceCents: 1900, minSeats: 1, maxSeats: 50 },
  team: { id: "team", unitPriceCents: 2900, minSeats: 3, maxSeats: 50, volume: { over: 10, rate: 0.05 } },
};

export type BillingPeriod = "monthly" | "annual";

export const ANNUAL_DISCOUNT_PERCENT = 20;
// Multiplier applied to the monthly seat price on annual billing (0.8).
export const ANNUAL_PRICE_FACTOR = (100 - ANNUAL_DISCOUNT_PERCENT) / 100;
export const MONTHS_PER_YEAR = 12;

export type CouponCode = "SAVE10";

export const COUPONS: Record<CouponCode, { percentOff: number }> = {
  SAVE10: { percentOff: 10 },
};

// Case-insensitive, ignores all whitespace. Returns the canonical code or null.
export function parseCoupon(input: string): CouponCode | null {
  const code = input.replace(/\s+/g, "").toUpperCase();
  return Object.hasOwn(COUPONS, code) ? (code as CouponCode) : null;
}

export type Quote = {
  unitPriceCents: number;
  subtotalCents: number;
  volumeDiscountCents: number;
  volumeDiscountPercent: number;
  couponDiscountCents: number;
  totalCents: number;
};

export function clampSeats(planId: PlanId, seats: number): number {
  const { minSeats, maxSeats } = PLAN_CONFIGS[planId];
  if (!Number.isFinite(seats)) return minSeats;
  return Math.min(maxSeats, Math.max(minSeats, Math.trunc(seats)));
}

// The only place coupon math lives. Takes the amount the coupon percentage is applied to.
function couponFor(coupon: CouponCode | null, listCents: number): number {
  return coupon ? Math.round((listCents * COUPONS[coupon].percentOff) / 100) : 0;
}

// Shared by monthlyQuote and annualQuote. Zero when the plan has no tier or seats are not over it.
function volumeDiscountFor(planId: PlanId, seats: number, subtotalCents: number) {
  const { volume } = PLAN_CONFIGS[planId];
  if (!volume || !(seats > volume.over)) return { cents: 0, percent: 0 };
  return { cents: Math.round(subtotalCents * volume.rate), percent: Math.round(volume.rate * 100) };
}

// Monthly: volume discount (if the plan has a tier and it is reached), then the coupon on what is left.
export function monthlyQuote(planId: PlanId, seats: number, coupon: CouponCode | null = null): Quote {
  const { unitPriceCents } = PLAN_CONFIGS[planId];
  const subtotalCents = unitPriceCents * seats;
  const { cents: volumeDiscountCents, percent: volumeDiscountPercent } = volumeDiscountFor(planId, seats, subtotalCents);
  const discountedCents = subtotalCents - volumeDiscountCents;
  const couponDiscountCents = couponFor(coupon, discountedCents);
  return {
    unitPriceCents,
    subtotalCents,
    volumeDiscountCents,
    volumeDiscountPercent,
    couponDiscountCents,
    totalCents: discountedCents - couponDiscountCents,
  };
}

// Annual: 20% off the seat price first, then branch on the plan.
// Plans with a volume tier get the volume discount and never the coupon (finance has not approved
// stacking them yet). Plans without a tier get the coupon.
export function annualQuote(planId: PlanId, seats: number, coupon: CouponCode | null = null): Quote {
  const { unitPriceCents: monthlyCents, volume } = PLAN_CONFIGS[planId];
  const unitPriceCents = Math.round(monthlyCents * ANNUAL_PRICE_FACTOR);
  const subtotalCents = unitPriceCents * seats * MONTHS_PER_YEAR;

  if (volume) {
    const { cents: volumeDiscountCents, percent: volumeDiscountPercent } = volumeDiscountFor(planId, seats, subtotalCents);
    return {
      unitPriceCents,
      subtotalCents,
      volumeDiscountCents,
      volumeDiscountPercent,
      couponDiscountCents: 0,
      totalCents: subtotalCents - volumeDiscountCents,
    };
  }

  // Coupon is computed on the undiscounted list price (seats x monthly price x 12), then taken off the annual total.
  const couponDiscountCents = couponFor(coupon, monthlyCents * seats * MONTHS_PER_YEAR);
  return {
    unitPriceCents,
    subtotalCents,
    volumeDiscountCents: 0,
    volumeDiscountPercent: 0,
    couponDiscountCents,
    totalCents: subtotalCents - couponDiscountCents,
  };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
