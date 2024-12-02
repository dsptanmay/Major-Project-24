"use client";
import { client, wallets } from "@/app/client";
import { LaptopMinimalCheck } from "lucide-react";
import React from "react";
import { ConnectButton, darkTheme } from "thirdweb/react";

function AccessControlPage() {
  return (
    <div className="h-screen max:h-screen-auto flex flex-col space-y-8 bg-gradient-to-br from-yellow-400/35 to-purple-400/60 p-10">
      <header className="p-5 flex justify-between items-center rounded-lg drop-shadow-sm hover:drop-shadow-md transition-all duration-200 bg-white">
        <div className="flex justify-center space-x-3">
          <LaptopMinimalCheck className="text-indigo-600 w-7 h-7" />
          <h1 className="font-bold text-2xl text-gray-800">Access Control</h1>
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
      <div className="bg-white rounded-lg drop-shadow-sm hover:drop-shadow-md transition-all duration-200 p-5"></div>
    </div>
  );
}

export default AccessControlPage;
