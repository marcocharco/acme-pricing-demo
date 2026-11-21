"use client";

import { useState } from "react";
import PlanCard, { type PlanContent } from "@/components/PlanCard";
import {
  PLAN_CONFIGS,
  annualQuote,
  monthlyQuote,
  formatCents,
  type BillingPeriod,
  type CouponCode,
  type PlanId,
} from "@/lib/pricing";

// Owns the seat count for one plan, so each card is independent.
export default function PricingCard({
  planId,
  content,
  coupon,
  period,
}: {
  planId: PlanId;
  content: PlanContent;
  coupon: CouponCode | null;
  period: BillingPeriod;
}) {
  const { minSeats, maxSeats } = PLAN_CONFIGS[planId];
  const [seats, setSeats] = useState(minSeats);
  const quote = period === "annual" ? annualQuote(planId, seats, coupon) : monthlyQuote(planId, seats, coupon);

  return (
    <PlanCard
      plan={{
        ...content,
        pricePerSeat: formatCents(quote.unitPriceCents),
        seats: Math.max(minSeats, seats),
        subtotal: formatCents(quote.subtotalCents),
        total: formatCents(quote.totalCents),
        period,
        volumeDiscount:
          quote.volumeDiscountCents > 0
            ? { label: `${quote.volumeDiscountPercent}%`, amount: formatCents(quote.volumeDiscountCents) }
            : undefined,
        couponDiscount:
          coupon && quote.couponDiscountCents > 0
          ? { label: coupon, amount: formatCents(quote.couponDiscountCents) }
          : undefined,
      }}
      onDecrease={() => setSeats((s) => Math.max(1, s - 1))}
      onIncrease={() => setSeats((s) => Math.min(maxSeats, s + 1))}
    />
  );
}
