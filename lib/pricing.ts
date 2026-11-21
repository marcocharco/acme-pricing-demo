// Pricing rules. Pure functions, no React. All money is integer cents.

export type PlanId = "pro" | "team";

export type PlanConfig = {
  id: PlanId;
  unitPriceCents: number; // per seat per month
  minSeats: number;
  maxSeats: number;
};

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  pro: { id: "pro", unitPriceCents: 1900, minSeats: 1, maxSeats: 50 },
  team: { id: "team", unitPriceCents: 2900, minSeats: 3, maxSeats: 50 },
};

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
  seats: number; // clamped to the plan's range
  unitPriceCents: number;
  subtotalCents: number;
  couponDiscountCents: number;
  totalCents: number;
};

export function clampSeats(planId: PlanId, seats: number): number {
  const { minSeats, maxSeats } = PLAN_CONFIGS[planId];
  if (!Number.isFinite(seats)) return minSeats;
  return Math.min(maxSeats, Math.max(minSeats, Math.trunc(seats)));
}

export function calculateQuote(planId: PlanId, seats: number, coupon: CouponCode | null = null): Quote {
  const { unitPriceCents } = PLAN_CONFIGS[planId];
  const clamped = clampSeats(planId, seats);
  const subtotalCents = unitPriceCents * clamped;
  const couponDiscountCents = coupon ? Math.round((subtotalCents * COUPONS[coupon].percentOff) / 100) : 0;
  return {
    seats: clamped,
    unitPriceCents,
    subtotalCents,
    couponDiscountCents,
    totalCents: subtotalCents - couponDiscountCents,
  };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
