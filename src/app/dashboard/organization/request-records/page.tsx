"use client";
import { client, wallets } from "@/app/client";
import { useUser } from "@clerk/nextjs";
import { ChevronRight, Home, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";

export default function RequestRecords() {
  const { user } = useUser();
  const activeAccount = useActiveAccount();
  const [formData, setFormData] = useState({
    user_address: "",
    tokenId: "",
    comments: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      org_address: activeAccount!.address,
      org_name: user!.username!,
      user_address: formData.user_address,
      nft_token_id: formData.tokenId,
      comments: formData.comments,
    };
    // console.log(data);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast.success("Notification sent successfully!");
      }
      setFormData({
        user_address: "",
        tokenId: "",
        comments: "",
      });
    } catch (error: any) {
      toast.error(error);
    }
  };

  // Check if all fields are filled
  const isFormValid =
    formData.user_address.trim() !== "" &&
    formData.tokenId.trim() !== "" &&
    formData.comments.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-5xl mx-auto flex flex-col space-y-4">
        <div className="text-center flex justify-between bg-white rounded-lg px-10 py-5 align-middle items-center">
          <h1 className="text-2xl font-bold text-gray-800">Request Access</h1>
          <ConnectButton
            client={client}
            wallets={wallets}
            theme={darkTheme({
              colors: {
                primaryButtonBg: "hsl(142, 70%, 45%)",
                primaryButtonText: "hsl(0, 0%, 100%)",
              },
            })}
            connectButton={{ label: "Connect Wallet" }}
            connectModal={{
              size: "compact",
              title: "Connect Wallet",
              showThirdwebBranding: false,
            }}
          />
        </div>

        <div className="bg-white shadow-2xl rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="toId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Patient's Wallet Address <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                id="toId"
                name="user_address"
                value={formData.user_address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter patient's wallet Address"
              />
            </div>

            <div>
              <label
                htmlFor="tokenId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Token ID of Document <span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                id="tokenId"
                name="tokenId"
                value={formData.tokenId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter token ID of document"
              />
            </div>

            <div>
              <label
                htmlFor="comments"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Comments <span className="text-red-700">*</span>
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your comments"
              />
            </div>

            {activeAccount && (
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ease-in-out transform ${
                  isFormValid
                    ? "bg-blue-600 hover:bg-blue-700 hover:scale-105 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Submit Request
              </button>
            )}
            {!activeAccount && (
              <div className="bg-red-200 border-2 border-red-600 text-red-700 px-5 py-5 text-center w-full rounded-md drop-shadow-sm font-semibold">
                You must connect your wallet first!
              </div>
            )}
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/organization"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <LayoutDashboard className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Dashboard
                </h2>
                <p className="text-sm text-gray-600">Return to dashboard</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </Link>

          <Link
            href="/"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Home className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Home</h2>
                <p className="text-sm text-gray-600">Return to homepage</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </Link>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
