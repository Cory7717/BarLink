import Navigation from "@/components/Navigation";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 space-y-4">
        <h1 className="text-3xl font-bold">Refund Policy</h1>
        <p className="text-sm text-slate-300">Updated Jan 2026</p>
        <div className="space-y-3 text-slate-200 text-sm leading-relaxed">
          <p>Subscriptions bill in advance for the selected term (monthly, 6 months, yearly). You can cancel anytime in the billing portal; access remains until the current period ends.</p>
          <p>We do not offer prorated refunds for partial periods. If you believe you were charged in error, contact coryarmer@gmail.com within 14 days.</p>
        </div>
      </main>
    </div>
  );
}
