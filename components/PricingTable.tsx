"use client";

import { useState } from "react";
import type { PlanContent } from "@/components/PlanCard";
import PricingCard from "@/components/PricingCard";
import { ANNUAL_DISCOUNT_PERCENT, COUPONS, parseCoupon, type BillingPeriod, type CouponCode } from "@/lib/pricing";

const on = "rounded-full px-5 py-1.5 text-sm font-medium transition-colors bg-foreground text-background";
const off = "rounded-full px-5 py-1.5 text-sm font-medium transition-colors text-muted hover:text-foreground";

// Owns the billing period and coupon, which apply to every card.
export default function PricingTable({ pro, team }: { pro: PlanContent; team: PlanContent }) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
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
        <div className="mt-8 flex justify-center">
          <div className="relative inline-flex">
            <div className="inline-flex rounded-full border border-line bg-panel p-1">
              <button className={period === "monthly" ? on : off} aria-pressed={period === "monthly"} onClick={() => setPeriod("monthly")}>
                Monthly
              </button>
              <button className={period === "annual" ? on : off} aria-pressed={period === "annual"} onClick={() => setPeriod("annual")}>
                Annual
              </button>
            </div>
            {period === "annual" && (
              <span className="absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-chip px-2.5 py-0.5 text-xs font-medium">
                Save {ANNUAL_DISCOUNT_PERCENT}%
              </span>
            )}
          </div>
        </div>
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
        <PricingCard planId="pro" content={pro} coupon={coupon} period={period} />
        <PricingCard planId="team" content={team} coupon={coupon} period={period} />
      </div>
    </>
  );
}
