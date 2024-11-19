import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-screen flex justify-center align-middle items-center bg-gradient-to-br from-blue-300 via-orange-300 to-purple-400 h-screen">
      <SignIn forceRedirectUrl="/role-select" />
    </div>
  );
}
