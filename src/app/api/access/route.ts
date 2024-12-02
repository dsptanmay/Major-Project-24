import { db } from "@/database/db";
import { organizationGrantedTokens, userNFTsTable } from "@/database/schema";
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
        token_id: organizationGrantedTokens.token_id,
        title: organizationGrantedTokens.title,
      })
      .from(userNFTsTable)
      .innerJoin(
        organizationGrantedTokens,
        eq(userNFTsTable.token_id, organizationGrantedTokens.token_id)
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
