import type { PlanContent } from "@/components/PlanCard";
import PricingTable from "@/components/PricingTable";

const PRO: PlanContent = {
  name: "Pro",
  blurb: "For small teams getting started.",
  features: ["1 to 50 seats", "Email support"],
};

const TEAM: PlanContent = {
  name: "Team",
  blurb: "For growing teams that want volume pricing.",
  features: ["3 to 50 seats", "5% off at 10 or more seats", "Priority support"],
  featured: true,
};

export default function Pricing() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-6 text-2xl font-bold tracking-tight">ACME</div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-20">
        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">Pricing</h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-muted">Pick a plan, add your seats, start a free trial.</p>
        </div>

        <PricingTable pro={PRO} team={TEAM} />
      </main>
    </>
  );
}
