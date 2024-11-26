export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;

import { contract } from "@/app/client";
import { NextRequest, NextResponse } from "next/server";
import { readContract } from "thirdweb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get("userAddress");
    const tokenId = searchParams.get("tokenId");
    if (!userAddress || !tokenId)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const data = await readContract({
      contract,
      method:
        "function getIPFSHash(uint256 tokenId, address caller) view returns (string)",
      params: [BigInt(tokenId), userAddress],
    });
    if (data) return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in fetching IPFS Hash", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
