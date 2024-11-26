"use client";
import React, { useEffect, useState } from "react";
import { client, wallets } from "@/app/client";
import { ConnectButton, darkTheme, useActiveAccount } from "thirdweb/react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  LayoutDashboard,
  SquareArrowOutUpRight,
} from "lucide-react";

interface Notification {
  from_id: string;
  to_id: string;
  nft_token_id: string;
  comments: string;
  status: "pending" | "approved" | "denied";
}

const StatusLabel: React.FC<{ status: Notification["status"] }> = ({
  status,
}) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    denied: "bg-red-100 text-red-800",
  };

  const statusText = {
    pending: "Pending",
    approved: "Approved",
    denied: "Denied",
  };

  return (
    <span
      className={`px-3 py-2 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {statusText[status]}
    </span>
  );
};
const NotificationsPage: React.FC = () => {
  const activeAccount = useActiveAccount();
  const [notifications, setNotifications] = useState<Notification[]>();

  useEffect(() => {
    async function fetchData() {
      const orgId = activeAccount!.address;
      const response = await fetch(`/api/notifications?orgId=${orgId}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data);
    }
    if (activeAccount) fetchData();
  }, [activeAccount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              NFT Notifications
            </h1>
          </div>
          <div>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Notifications
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NFT Token ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    View
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notifications &&
                  notifications.map((notification, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.to_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.nft_token_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {notification.comments.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusLabel status={notification.status} />
                      </td>
                      <td>
                        {notification.status === "approved" && (
                          <Link
                            className="w-full flex items-center text-sm text-center justify-center text-gray-700"
                            href={`/dashboard/organization/${notification.nft_token_id}`}
                          >
                            <SquareArrowOutUpRight className="h-4 text-gray-600" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {notifications && notifications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No notifications found.</p>
              </div>
            )}
          </div>
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
      </main>
    </div>
  );
};

export default NotificationsPage;
