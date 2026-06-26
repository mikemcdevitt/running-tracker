import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, miles, kwh, odo, total_kwh } = body;

  await sql`
    INSERT INTO tracking.ev (date, miles, kwh, odo, total_kwh)
    VALUES (
      ${date}, ${parseFloat(miles)}, ${parseFloat(kwh)},
      ${odo ? parseFloat(odo) : null}, ${total_kwh ? parseFloat(total_kwh) : null}
    )
  `;

  return NextResponse.json({ success: true });
}

export async function GET() {
  const rows = await sql`SELECT * FROM tracking.ev ORDER BY date DESC LIMIT 30`;
  return NextResponse.json(rows);
}