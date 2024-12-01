"use client";

import Link from "next/link";
import "./page.css";
import { Bell, Check, Home, LayoutDashboard, X } from "lucide-react";
import {
  ConnectButton,
  darkTheme,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import { client, contract, wallets } from "@/app/client";
import { useEffect, useState } from "react";
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

const NotificationsPage = () => {
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
    <div className="h-screen max:h-screen-auto flex flex-col space-y-8 bg-gradient-to-br from-yellow-400/35 to-purple-400/60 p-10">
      <header className="bg-white rounded-lg drop-shadow-sm hover:drop-shadow-md transition-all duration-200 p-5 flex justify-between w-full">
        <div className="flex space-x-3 p-3 items-center justify-center">
          <Bell className="text-indigo-600 w-8 h-8" />
          <h1 className="font-bold text-2xl text-gray-800">Notifications</h1>
        </div>
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
      </header>
      <div className="bg-white rounded-lg drop-shadow-sm p-10 hover:drop-shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="">
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
      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/user" className="w-full">
          <div className="bg-white rounded-xl border-2 border-blue-200 p-6 flex items-center space-x-4 transform transition-all duration-100 hover:shadow-md hover:border-blue-400 group">
            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
              <LayoutDashboard className="text-blue-600 w-7 h-7" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-700 transition-colors">
                Dashboard
              </h3>
              <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                Manage your documents and settings
              </p>
            </div>
          </div>
        </Link>

        <Link href="/" className="w-full">
          <div className="bg-white rounded-xl border-2 border-green-200 p-6 flex items-center space-x-4 transform transition-all duration-100 hover:shadow-md hover:border-green-400 group">
            <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
              <Home className="text-green-600 w-7 h-7" />
            </div>
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-700 transition-colors">
                Home
              </h3>
              <p className="text-sm text-gray-500 group-hover:text-green-600 transition-colors">
                Return to main landing page
              </p>
            </div>
          </div>
        </Link>
      </div>
      <Toaster />
    </div>
  );
};

export default NotificationsPage;
