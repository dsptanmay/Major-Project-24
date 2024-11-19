import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userRole = user.publicMetadata.role;
  return NextResponse.json({ userRole });
}
