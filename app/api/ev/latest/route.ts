import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);
  const result = await sql`
    SELECT date, odo, total_kwh 
    FROM tracking.ev 
    ORDER BY date DESC, id DESC 
    LIMIT 1
  `;

  const latest = result[0];
  const defaultDate = new Date().toISOString().split("T")[0]; // Default to today

  return NextResponse.json({
    date: defaultDate,
    odo: latest ? parseFloat(latest.odo) : 0,
    total_kwh: latest ? parseFloat(latest.total_kwh ?? "0") : 0,
  });
}
