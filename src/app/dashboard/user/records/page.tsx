"use client";

import Link from "next/link";
import { Home, LayoutDashboard, FileText, ChevronRight } from "lucide-react";

export default function UserRecordsPage() {
  const recentRecords = [
    { id: 1, date: "2024-11-09", organization: "ABC", status: "Available" },
    { id: 2, date: "2024-11-08", organization: "DEF", status: "Restricted" },
    { id: 3, date: "2024-11-07", organization: "XYZ", status: "Available" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Medical Records
            </h1>
          </div>
          <p className="text-gray-600">
            View and manage all your medical records in one place.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Records
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Record ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Organization
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm">{`#${record.id}`}</td>
                    <td className="py-3 px-4 text-sm">{record.date}</td>
                    <td className="py-3 px-4 text-sm">{record.organization}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${
                                                  record.status === "Available"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-yellow-800"
                                                }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard"
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
    </div>
  );
}
