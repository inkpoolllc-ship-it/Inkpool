import { NextResponse } from "next/server";
import { getCreditBalances } from "@/lib/credits";
export async function GET() {
  const balances = await getCreditBalances();
  return NextResponse.json({ balances });
}


