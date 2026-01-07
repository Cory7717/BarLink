import Navigation from "@/components/Navigation";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 space-y-4">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-slate-300">Updated Jan 2026</p>
        <div className="space-y-3 text-slate-200 text-sm leading-relaxed">
          <p>We collect account info, bar profile data, and usage analytics to operate BarPulse. We do not sell personal data.</p>
          <p>We store payment details via Stripe; we never store full card numbers. Media uploads are stored on AWS S3.</p>
          <p>You may request deletion of your account data by contacting support@barpulse.com.</p>
        </div>
      </main>
    </div>
  );
}
