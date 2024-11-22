import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import { ThirdwebProvider } from "thirdweb/react";

async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const currentRole = user?.publicMetadata.role;
  if (!user) redirect("/sign-in");
  if (!currentRole) redirect("/role-select");
  if (currentRole !== "user") redirect("/");
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}

export default UserDashboardLayout;
