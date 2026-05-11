import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import { getAgentIdentity } from "@sik-sdk/agent";

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) return NextResponse.json({ error: "domain required" }, { status: 400 });

  const rpc = process.env["NEXT_PUBLIC_RPC_URL"] ?? "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpc, "confirmed");

  try {
    const identity = await getAgentIdentity(domain, connection);
    return NextResponse.json(identity);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 404 });
  }
}
