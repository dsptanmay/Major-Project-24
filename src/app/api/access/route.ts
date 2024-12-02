import { db } from "@/database/db";
import {
  notificationsTable,
  organizationGrantedTokens,
  organizationWalletTable,
  userNFTsTable,
} from "@/database/schema";
import { and, eq } from "drizzle-orm";
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
        nft_token_id: organizationGrantedTokens.token_id,
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

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organization_name = searchParams.get("orgName");
    const nft_token_id = searchParams.get("tokenId");
    if (!organization_name || !nft_token_id)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const deletedRecords = await db
      .delete(organizationGrantedTokens)
      .where(
        and(
          eq(organizationGrantedTokens.token_id, nft_token_id),
          eq(organizationGrantedTokens.org_name, organization_name)
        )
      )
      .returning();

    const deletedNotifications = await db
      .delete(notificationsTable)
      .where(
        and(
          eq(notificationsTable.nft_token_id, nft_token_id),
          eq(notificationsTable.org_name, organization_name)
        )
      )
      .returning();

    if (deletedNotifications.length === 0 || deletedRecords.length === 0)
      return NextResponse.json({ error: "Missing token ID" }, { status: 404 });

    return NextResponse.json(
      { message: "Deleted records successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
