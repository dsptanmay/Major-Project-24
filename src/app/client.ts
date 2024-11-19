import { createThirdwebClient, defineChain, getContract } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

const clientID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientID) throw new Error("No Client ID provided!");

export const client = createThirdwebClient({ clientId: clientID });

export const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: "0x70b6a0Bf1Fc92fE18D9cD940784081a5c368bE48",
});

export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
];
