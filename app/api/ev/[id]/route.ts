import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, canEdit } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await sql`SELECT * FROM tracking.ev WHERE id = ${parseInt(id)}`;
  if (!result[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canEdit(session.user?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { date, miles, kwh, odo, total_kwh, minutes } = body;

  await sql`
    UPDATE tracking.ev SET
      date = ${date},
      miles = ${parseFloat(miles)},
      kwh = ${parseFloat(kwh)},
      odo = ${odo ? parseFloat(odo) : null},
      total_kwh = ${total_kwh ? parseFloat(total_kwh) : null},
      minutes = ${minutes ? parseFloat(minutes) : null}
    WHERE id = ${parseInt(id)}
  `;

  return NextResponse.json({ success: true });
}
