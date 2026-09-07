import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { date, miles, minutes, location, zip, shoes, treadmill, race, ioana, stroller } = body;

  await sql`
    INSERT INTO tracking.runs (date, miles, minutes, location, zip, shoes, treadmill, race, ioana, stroller)
    VALUES (
      ${date}, ${parseFloat(miles)}, ${parseFloat(minutes)},
      ${location || null}, ${zip || null}, ${shoes},
      ${!!treadmill}, ${!!race}, ${!!ioana}, ${!!stroller}
    )
  `;

  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runs = await sql`
    SELECT * FROM tracking.runs ORDER BY date DESC LIMIT 30
  `;
  return NextResponse.json(runs);
}
