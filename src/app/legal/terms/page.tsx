import Navigation from "@/components/Navigation";

export default function TermsPage() {
  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 space-y-4">
        <h1 className="text-3xl font-semibold text-gradient">Terms of Service</h1>
        <p className="text-sm text-slate-300">Updated Jan 2026</p>
        <div className="glass-panel rounded-3xl p-6 space-y-3 text-slate-200 text-sm leading-relaxed">
          <p>BarLink provides a platform for bar owners to publish offerings and for patrons to discover bars. By using the service, you agree to comply with applicable laws and not post illegal or abusive content.</p>
          <p>Subscriptions renew automatically unless canceled in the billing portal. Refunds are governed by our refund policy.</p>
          <p>We may suspend or remove content that violates these terms.</p>
        </div>
      </main>
    </div>
  );
}
