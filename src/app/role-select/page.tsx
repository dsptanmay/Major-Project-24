"use client";
import { SignOutButton, useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

function RoleSelectionPage() {
  const router = useRouter();
  const { user } = useUser();
  const [role, setRole] = useState<"user" | "medical_organization">();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  
  const handleSubmit = async () => {
    if (!role) {
      toast.error("Please select a role before submitting");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: role, userId: user?.id }),
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok && data.success) {
        toast.success("Role set successfully!");
        router.push(
          role === "user" ? "/dashboard/user" : "/dashboard/organization"
        );
      } else {
        toast.error("Failed to set the role. Please try again!");
      }
    } catch (err) {
      setIsLoading(false);
      toast.error(
        "An error occurred while setting your role. Please try again!"
      );
    }
  };
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center align-middle p-20 bg-gradient-to-b from-blue-300 via-orange-300 to-purple-400">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Select Your Role
        </h1>

        <div className="flex flex-col gap-4">
          {/* Role options */}
          <button
            onClick={() => setRole("user")}
            className={`flex items-center p-4 border rounded-lg ${
              role === "user" ? "border-blue-500 bg-blue-50" : "border-gray-200"
            } hover:shadow-sm transition-all`}
          >
            <CheckCircleIcon
              className={`h-6 w-6 ${
                role === "user" ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <span className="ml-3 text-gray-700">User</span>
          </button>

          <button
            onClick={() => setRole("medical_organization")}
            className={`flex items-center p-4 border rounded-lg ${
              role === "medical_organization"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            } hover:shadow-sm transition-all`}
          >
            <CheckCircleIcon
              className={`h-6 w-6 ${
                role === "medical_organization"
                  ? "text-blue-500"
                  : "text-gray-400"
              }`}
            />
            <span className="ml-3 text-gray-700">Medical Organization</span>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!role || isLoading}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Role"}
        </button>
        <SignOutButton>
          <button className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50">
            Sign Out
          </button>
        </SignOutButton>
      </div>
      <Toaster />
    </div>
  );
}

export default RoleSelectionPage;
