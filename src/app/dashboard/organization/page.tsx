"use client";
import { client, wallets } from "@/app/client";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  LogOut,
  Layout,
  FileText,
  Home,
  ChevronRight,
  UploadCloud,
  FileCode2,
  GitPullRequestDraft,
  ClipboardPlus,
} from "lucide-react";
import Link from "next/link";
import { ConnectButton, darkTheme } from "thirdweb/react";

export default function OrganizationDashboard() {
  const { user } = useUser();
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Layout className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex space-x-4">
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
            <SignOutButton redirectUrl="/">
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-red-600 transition-all">
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </SignOutButton>
          </div>
        </header>

        {/* Navigation Cards */}
        <p className="font-semibold text-gray-700 mb-2">
          Welcome, {user?.username}. Here you can access functions available to
          your organization.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/organization/documents"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Documents
                </h2>
                <p className="text-sm text-gray-600">
                  View and manage documents you have access to
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </Link>

          <Link
            href="/dashboard/organization/notifications"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <GitPullRequestDraft className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h2>
                <p className="text-sm text-gray-600">
                  See list of pending requests for access
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </Link>

          <Link
            href="/dashboard/organization/request-records"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <ClipboardPlus className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Request Access
                </h2>
                <p className="text-sm text-gray-600">
                  Request access for documents from patients
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </Link>

          <Link
            href="/dashboard/organization/view/{id}"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <UploadCloud className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Fetch IPFS Documents
                </h2>
                <p className="text-sm text-gray-600">
                  Download documents from NFTs you have access to
                </p>
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
    </div>
  );
}
