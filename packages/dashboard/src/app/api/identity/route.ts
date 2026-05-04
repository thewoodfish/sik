import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import { getIdentity } from "@sik/core";

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) return NextResponse.json({ error: "domain required" }, { status: 400 });

  const rpc = process.env["NEXT_PUBLIC_RPC_URL"] ?? "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpc, "confirmed");

  try {
    const identity = await getIdentity(domain, connection, { cache: false });
    return NextResponse.json(identity);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 404 });
  }
}
