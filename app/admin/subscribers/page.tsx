import { listSubscribers, isSubscribersStoreConfigured } from "@/lib/subscribers-store";
import { isResendConfigured } from "@/lib/resend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Subscribers — Admin",
  robots: { index: false, follow: false },
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toISOString().replace("T", " ").slice(0, 19) + " UTC";
  } catch {
    return iso;
  }
}

export default async function SubscribersAdminPage() {
  const storeOk = isSubscribersStoreConfigured();
  const resendOk = isResendConfigured();
  const subscribers = storeOk ? await listSubscribers() : [];

  const fallbackCount = subscribers.filter((s) => s.mode === "fallback").length;
  const resendCount = subscribers.filter((s) => s.mode === "resend").length;

  return (
    <section className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="font-bangers text-electric-pink tracking-widest text-sm">ADMIN</p>
          <h1 className="heading text-4xl md:text-5xl text-white mt-1">SUBSCRIBERS</h1>
          <p className="text-text-muted text-sm mt-2">
            Captured to Upstash Redis on every signup, regardless of Resend status.
          </p>
        </div>
        {subscribers.length > 0 && (
          <a
            href="/admin/subscribers/export"
            className="font-bebas tracking-wide uppercase bg-gold text-bg-primary border-2 border-gold rounded-md px-5 py-3 hover:bg-gold-light hover:shadow-glow-gold transition-all whitespace-nowrap"
          >
            DOWNLOAD CSV
          </a>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={subscribers.length} />
        <Stat label="Pre-Resend" value={fallbackCount} hint="mode=fallback" />
        <Stat label="Post-Resend" value={resendCount} hint="mode=resend" />
        <Stat
          label="Resend"
          value={resendOk ? "ON" : "OFF"}
          hint={resendOk ? "live" : "not configured"}
        />
      </div>

      {!storeOk && (
        <div className="mt-8 border-2 border-electric-pink/40 bg-electric-pink/10 rounded-md p-4 text-sm">
          <p className="font-bebas tracking-wide text-electric-pink text-lg">
            SUBSCRIBERS STORE NOT CONFIGURED
          </p>
          <p className="text-text-primary/85 mt-1">
            Set <code className="bg-bg-primary/60 px-1 rounded">UPSTASH_REDIS_REST_URL</code> and{" "}
            <code className="bg-bg-primary/60 px-1 rounded">UPSTASH_REDIS_REST_TOKEN</code> in Vercel. Until then,
            no signups are persisted here — Discord webhook + server log only.
          </p>
        </div>
      )}

      <div className="mt-10 border border-purple-core/30 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary/60 text-text-muted uppercase text-xs tracking-widest">
            <tr>
              <th className="text-left px-4 py-3 font-bebas">Email</th>
              <th className="text-left px-4 py-3 font-bebas">Captured</th>
              <th className="text-left px-4 py-3 font-bebas">Mode</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-text-muted">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.email} className="border-t border-purple-core/15">
                  <td className="px-4 py-3 text-text-primary break-all">{s.email}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{fmtDate(s.ts)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-bangers tracking-widest text-xs px-2 py-0.5 rounded ${
                        s.mode === "fallback"
                          ? "bg-electric-pink/20 text-electric-pink"
                          : "bg-electric-blue/20 text-electric-blue"
                      }`}
                    >
                      {s.mode}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-text-muted text-xs mt-6">
        Backfill workflow: Download CSV → Resend dashboard → Audiences → Import contacts.
      </p>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="border border-purple-core/30 rounded-md px-4 py-3">
      <p className="text-text-muted text-xs uppercase tracking-widest">{label}</p>
      <p className="heading text-3xl text-white mt-1">{value}</p>
      {hint && <p className="text-text-muted text-xs mt-1">{hint}</p>}
    </div>
  );
}
