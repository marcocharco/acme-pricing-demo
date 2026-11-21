"use client";

import { useState } from "react";
import PlanCard, { type PlanContent } from "@/components/PlanCard";
import {
  PLAN_CONFIGS,
  calculateQuote,
  clampSeats,
  formatCents,
  type CouponCode,
  type PlanId,
} from "@/lib/pricing";

// Owns the seat count for one plan, so each card is independent.
export default function PricingCard({
  planId,
  content,
  coupon,
}: {
  planId: PlanId;
  content: PlanContent;
  coupon: CouponCode | null;
}) {
  const { minSeats, maxSeats } = PLAN_CONFIGS[planId];
  const [seats, setSeats] = useState(minSeats);
  const quote = calculateQuote(planId, seats, coupon);

  return (
    <PlanCard
      plan={{
        ...content,
        pricePerSeat: formatCents(quote.unitPriceCents),
        seats: quote.seats,
        subtotal: formatCents(quote.subtotalCents),
        total: formatCents(quote.totalCents),
        couponDiscount: coupon
          ? { label: coupon, amount: formatCents(quote.couponDiscountCents) }
          : undefined,
      }}
      onDecrease={() => setSeats((s) => clampSeats(planId, s - 1))}
      onIncrease={() => setSeats((s) => clampSeats(planId, s + 1))}
      canDecrease={quote.seats > minSeats}
      canIncrease={quote.seats < maxSeats}
    />
  );
}
