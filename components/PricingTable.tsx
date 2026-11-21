"use client";

import { useState } from "react";
import type { PlanContent } from "@/components/PlanCard";
import PricingCard from "@/components/PricingCard";
import { COUPONS, parseCoupon, type CouponCode } from "@/lib/pricing";

// Owns the coupon, which applies to every card.
export default function PricingTable({ pro, team }: { pro: PlanContent; team: PlanContent }) {
  const [input, setInput] = useState("");
  const [coupon, setCoupon] = useState<CouponCode | null>(null);
  const [message, setMessage] = useState("");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseCoupon(input);
    setCoupon(parsed);
    setMessage(parsed ? `${parsed} applied: ${COUPONS[parsed].percentOff}% off` : "Invalid code");
  }

  return (
    <>
      <div className="text-center">
        <form onSubmit={apply} className="mx-auto mt-5 flex max-w-xs gap-2">
          <input
            aria-label="Coupon code"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-muted"
            placeholder="Coupon code"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-full border border-line px-5 py-2 text-sm font-medium transition-colors hover:bg-chip"
          >
            Apply
          </button>
        </form>
        <p role="status" className="mt-2 h-5 text-sm text-muted">
          {message}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <PricingCard planId="pro" content={pro} coupon={coupon} />
        <PricingCard planId="team" content={team} coupon={coupon} />
      </div>
    </>
  );
}
