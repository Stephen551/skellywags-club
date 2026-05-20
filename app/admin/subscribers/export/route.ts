import { listSubscribers } from "@/lib/subscribers-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const subscribers = await listSubscribers();

  const header = "email,captured_at,mode";
  const rows = subscribers.map((s) =>
    [csvEscape(s.email), csvEscape(s.ts), csvEscape(s.mode)].join(","),
  );
  const body = [header, ...rows].join("\n") + "\n";

  const filename = `skellywags-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
