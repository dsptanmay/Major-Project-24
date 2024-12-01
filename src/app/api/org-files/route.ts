import { db } from "@/database/db";
import { organizationGrantedTokens, userNFTsTable } from "@/database/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface OrganizationPostRequest {
  org_name: string;
  token_id: string;
  title: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: OrganizationPostRequest = await request.json();
    const { org_name, token_id } = body;

    if (!org_name || !token_id)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 404 }
      );

    const userData = await db
      .select()
      .from(userNFTsTable)
      .where(eq(userNFTsTable.token_id, token_id));

    if (userData.length === 0)
      return NextResponse.json(
        { error: "Token does not exist" },
        { status: 400 }
      );
    const title = userData[0].title;
    const description = userData[0].description;
    const newRecord = await db
      .insert(organizationGrantedTokens)
      .values({ org_name, token_id, title, description })
      .returning();

    if (newRecord.length === 0)
      return NextResponse.json(
        { error: "Organization already has access to token" },
        { status: 401 }
      );

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const org_address = searchParams.get("orgId");
    const orgData = await db.query.organizationWalletTable.findFirst({
      where: (record, { eq }) => eq(record.wallet_address, org_address!),
      columns: {
        organization_name: true,
        wallet_address: false,
      },
    });
    const org_name = orgData!.organization_name;
    const grantedTokens = await db.query.organizationGrantedTokens.findMany({
      where: (record, { eq }) => eq(record.org_name, org_name),
      columns: {
        org_name: false,
        token_id: true,
        title: true,
        description: true,
      },
    });
    if (grantedTokens.length === 0)
      return NextResponse.json(
        { error: "Organization has no granted tokens" },
        { status: 404 }
      );

    return NextResponse.json(grantedTokens, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
