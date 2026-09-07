import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canEdit } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canEdit(session.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { date, miles, kwh, odo, total_kwh, minutes } = body;

  await sql`
    INSERT INTO tracking.ev (date, miles, kwh, odo, total_kwh, minutes)
    VALUES (
      ${date}, ${parseFloat(miles)}, ${parseFloat(kwh)},
      ${odo ? parseFloat(odo) : null}, ${total_kwh ? parseFloat(total_kwh) : null}, ${minutes ? parseFloat(minutes) : null}
    )
  `;

  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await sql`SELECT * FROM tracking.ev ORDER BY date DESC LIMIT 30`;
  return NextResponse.json(rows);
}
