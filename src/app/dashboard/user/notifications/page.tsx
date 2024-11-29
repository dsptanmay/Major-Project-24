"use client";
import React, { useEffect, useState } from "react";
import { Check, X, Wallet } from "lucide-react";
import { client, contract, wallets } from "@/app/client";
import {
  ConnectButton,
  darkTheme,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import toast, { Toaster } from "react-hot-toast";

interface Notification {
  org_address: string;
  org_name: string;
  user_address: string;
  nft_token_id: string;
  comments: string;
  status: "pending" | "approved" | "denied";
}

const NotificationsPage: React.FC = () => {
  const { mutate: sendTransaction } = useSendTransaction();

  const activeAccount = useActiveAccount();
  const [notifications, setNotifications] = useState<Notification[]>();

  useEffect(() => {
    async function fetchData() {
      const userId = activeAccount!.address;
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      const pendingNotifications = data.filter(
        (notification: Notification) => notification.status === "pending"
      );
      setNotifications(pendingNotifications);
    }
    if (activeAccount) fetchData();
  }, [activeAccount]);

  const handleApprove = async (notification: Notification) => {
    try {
      console.log("Granting access for notification:", notification);
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org_address: notification.org_address,
          x: notification.org_name,
          user_address: notification.user_address,
          nft_token_id: notification.nft_token_id,
          status: "approved",
        }),
      });

      const grantResponse = await fetch("/api/org-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: notification.org_name,
          token_id: notification.nft_token_id,
          wallet_address: activeAccount!.address,
        }),
      });
      const transaction = prepareContractCall({
        contract,
        method: "function grantAccess(uint256 tokenId, address user)",
        params: [BigInt(notification.nft_token_id), notification.org_address],
      });
      sendTransaction(transaction);

      if (response.ok && grantResponse.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications?.filter((n) => n !== notification)
        );
      } else {
        toast.error("Failed to grant access!");
      }
    } catch (error) {
      console.error("Error granting access:", error);
    }
  };

  const handleDeny = async (notification: Notification) => {
    try {
      console.log("Denying access for notification:", notification);
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org_address: notification.org_address,
          user_address: notification.user_address,
          nft_token_id: notification.nft_token_id,
          status: "denied",
        }),
      });

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications?.filter((n) => n !== notification)
        );
      }
    } catch (error) {
      console.error("Error denying access:", error);
    }
  };

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
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden">
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
                    Organization Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Org Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NFT Token ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                        {notification.org_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.org_address.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.nft_token_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {notification.comments.substring(0, 10)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => handleApprove(notification)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Grant
                        </button>
                        <button
                          onClick={() => handleDeny(notification)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Deny
                        </button>
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
      </main>
      <Toaster />
    </div>
  );
};

export default NotificationsPage;
