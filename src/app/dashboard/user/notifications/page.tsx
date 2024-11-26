import React from "react";
import { Check, X } from "lucide-react";

// Assuming this is the type for your notifications based on the table structure
interface Notification {
  from_id: string;
  to_id: string;
  nft_token_id: string;
  comments: string;
}

const NotificationsPage: React.FC = () => {
  // TODO: Replace with actual data fetching logic using Drizzle ORM
  const notifications: Notification[] = [
    // Placeholder data - replace with actual fetched notifications
    {
      from_id: "0x123",
      to_id: "activeAccountAddress",
      nft_token_id: "NFT001",
      comments: "Would like to grant access to this NFT",
    },
  ];

  // Skeleton function for handling grant action
  const handleGrant = async (notification: Notification) => {
    try {
      // TODO: Implement grant logic
      console.log("Granting access for notification:", notification);
      // Typically would involve:
      // 1. Updating database status
      // 2. Performing blockchain transaction if needed
      // 3. Removing notification from list
    } catch (error) {
      console.error("Error granting access:", error);
    }
  };

  // Skeleton function for handling deny action
  const handleDeny = async (notification: Notification) => {
    try {
      // TODO: Implement deny logic
      console.log("Denying access for notification:", notification);
      // Typically would involve:
      // 1. Updating database status
      // 2. Removing notification from list
    } catch (error) {
      console.error("Error denying access:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
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
              {notifications.map((notification, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.from_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notification.nft_token_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {notification.comments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => handleGrant(notification)}
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

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No notifications found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
