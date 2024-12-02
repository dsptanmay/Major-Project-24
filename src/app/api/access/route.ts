import { db } from "@/database/db";
import {
  organizationGrantedTokens,
  organizationWalletTable,
  userNFTsTable,
} from "@/database/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_address = searchParams.get("userAddress");
    if (!user_address)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const userTokens = await db
      .select({
        organization_name: organizationGrantedTokens.org_name,
        organization_address: organizationWalletTable.wallet_address,
        title: organizationGrantedTokens.title,
        token_id: organizationGrantedTokens.token_id,
      })
      .from(organizationGrantedTokens)
      .innerJoin(
        organizationWalletTable,
        eq(
          organizationGrantedTokens.org_name,
          organizationWalletTable.organization_name
        )
      )
      .innerJoin(
        userNFTsTable,
        eq(organizationGrantedTokens.token_id, userNFTsTable.token_id)
      )
      .where(eq(userNFTsTable.user_address, user_address!));

    if (userTokens.length === 0)
      return NextResponse.json(
        { error: "No records available" },
        { status: 404 }
      );

    return NextResponse.json(userTokens, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
