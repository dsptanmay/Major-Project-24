"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircle, FileText, CloudUpload } from "lucide-react";
import { upload } from "thirdweb/storage";
import Link from "next/link";
import { client, contract, wallets } from "@/app/client";
import {
  ConnectButton,
  darkTheme,
  MediaRenderer,
  useActiveAccount,
  useSendTransaction,
} from "thirdweb/react";
import { prepareContractCall, sendTransaction } from "thirdweb";

export default function UploadPage() {
  const activeAccount = useActiveAccount();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [currentIpfsLink, setCurrentIpfsLink] = useState<any>();
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const { mutate: sendTransaction } = useSendTransaction();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      const _uri = await upload({ client, files: acceptedFiles });
      console.log(_uri, typeof _uri);
      setCurrentIpfsLink(_uri);
      setUploading(false);
      setUploadSuccess(true);
    },
    [upload, activeAccount, currentIpfsLink]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "application/docx": [".docx"] }, // Accept document file types
    maxFiles: 1,
  });

  const mintNFTCall = async () => {
    setMinting(true);
    if (activeAccount) {
      const transaction = prepareContractCall({
        contract,
        method:
          "function mintNFT(address to, uint256 tokenId, string ipfsHash)",
        params: [activeAccount.address, BigInt(2), currentIpfsLink],
      });
      sendTransaction(transaction);
      setMinted(true);
    }
    setMinting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Create NFT from records
            </h1>
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
        </div>
        <p className="text-gray-600 mb-6">
          Upload your documents to IPFS for decentralized storage. Drag and drop
          your file below, and we'll take care of the rest.
        </p>
        {/* File Upload Area */}
        {activeAccount && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Drag & Drop your Document
            </h2>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col justify-center items-center cursor-pointer"
            >
              <input {...getInputProps()} />
              <CloudUpload className="w-8 h-8 text-indigo-600" />
              <p className="text-gray-600 text-center mt-4">
                Upload your document
              </p>
            </div>
          </div>
        )}
        {!activeAccount && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-sm mt-4 text-center">
            <p>Please connect your wallet to use the upload feature!</p>
          </div>
        )}
        {/* Upload Status */}
        {uploading && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-sm mt-4">
            <p>Uploading your document...</p>
          </div>
        )}
        {uploadSuccess && !uploading && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow-sm mt-4 flex">
            <CheckCircle className="w-6 h-6 inline-block mr-2" />
            <p>Your document has been successfully uploaded to IPFS! </p>
          </div>
        )}
        {uploadSuccess && currentIpfsLink && !minting && !minted && (
          <button
            className="bg-green-100 text-green-800 rounded-lg shadow-sm mt-4 border-2 border-green-800 px-6 py-2 w-full text-center"
            onClick={mintNFTCall}
          >
            Mint NFT
          </button>
        )}
        {minting && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-sm mt-4">
            <p>Minting your NFT...</p>
          </div>
        )}
        {minted && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow-sm mt-4 flex">
            <CheckCircle className="w-6 h-6 inline-block mr-2" />
            <p>Your document has been successfully converted to an NFT! </p>
          </div>
        )}
        {/* Error Message */}
        {!uploading && !uploadSuccess && currentIpfsLink && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-sm mt-4">
            <p>There was an error uploading your document. Please try again.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Link
            href="/dashboard/user"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  Go back to your dashboard
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Home</h2>
                <p className="text-sm text-gray-600">Return to homepage</p>
              </div>
            </div>
          </Link>
        </div>
        {/* {currentIpfsLink && (
          <MediaRenderer
            style={{ padding: 10, fontSize: 25, border: 2 }}
            client={client}
            src={currentIpfsLink!}
          />
        )} */}
      </div>
    </div>
  );
}
