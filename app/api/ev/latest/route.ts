import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const result = await sql`
    SELECT date, odo, total_kwh 
    FROM tracking.ev 
    ORDER BY date DESC, id DESC 
    LIMIT 1
  `;

  const latest = result[0];
  let defaultDate: string;

  if (latest) {
    const next = new Date(latest.date);
    next.setUTCDate(next.getUTCDate() + 1);
    defaultDate = next.toISOString().split("T")[0];
  } else {
    defaultDate = new Date().toISOString().split("T")[0];
  }

  return NextResponse.json({
    date: defaultDate,
    odo: latest ? parseFloat(latest.odo) : 0,
    total_kwh: latest ? parseFloat(latest.total_kwh ?? "0") : 0,
  });
}