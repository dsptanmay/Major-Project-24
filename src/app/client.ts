import { createThirdwebClient, defineChain, getContract } from "thirdweb";

const clientID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientID) throw new Error("No Client ID provided!");

export const client = createThirdwebClient({ clientId: clientID });

export const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: "",
});
