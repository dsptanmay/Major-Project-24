export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const maxDuration = 10;
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const RoleSelectLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await currentUser();
  const currentRole = user?.publicMetadata.role;
  if (currentRole)
    redirect(
      currentRole === "user" ? "/dashboard/user" : "/dashboard/organization"
    );
  if (!user) redirect("/sign-in");
  return <div>{children}</div>;
};

export default RoleSelectLayout;
