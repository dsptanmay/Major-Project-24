"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, message, Input, Typography, Card, Space } from "antd";
import { CloudUploadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { upload } from "thirdweb/storage";
import { client, contract, wallets } from "@/app/client";
import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { FileUp, Home, LayoutDashboard } from "lucide-react";

const { Paragraph } = Typography;

export default function UploadPage() {
  const { mutate: sendTransaction } = useSendTransaction();
  const activeAccount = useActiveAccount();
  const [uploadState, setUploadState] = useState({
    uploading: false,
    uploadSuccess: false,
    currentIpfsLink: "",
    minting: false,
    minted: false,
    description: "",
    title: "",
  });

  const { data: tokenID } = useReadContract({
    contract,
    method: "function nextTokenIdToMint() view returns (uint256)",
    params: [],
  });
  const onDrop = useCallback(async (acceptedFiles: Array<File>) => {
    const file = acceptedFiles[0];

    try {
      setUploadState((prev) => ({ ...prev, uploading: true }));
      const ipfsUri = await upload({ client, files: acceptedFiles });

      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        uploadSuccess: true,
        currentIpfsLink: ipfsUri as any as string,
      }));

      message.success("Document successfully uploaded!");
    } catch (error) {
      message.error("Upload failed");
      setUploadState((prev) => ({ ...prev, uploading: false }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const mintNFTCall = async () => {
    setUploadState((prev) => ({ ...prev, minting: true }));
    console.log(uploadState.currentIpfsLink);
    try {
      const response = await fetch("/api/user-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_id: tokenID!.toString(),
          user_address: activeAccount!.address,
          title: uploadState.title,
          description: uploadState.description,
        }),
      });

      const transaction = prepareContractCall({
        contract,
        method:
          "function mintNFT(address to, string ipfsHash) returns (uint256)",
        params: [activeAccount!.address, uploadState.currentIpfsLink],
      });
      sendTransaction(transaction);

      setUploadState((prev) => ({
        ...prev,
        minting: false,
        minted: true,
      }));

      message.success("NFT minted successfully!");
    } catch (error) {
      message.error("Minting failed");
      console.error(error);
      setUploadState((prev) => ({ ...prev, minting: false }));
    }
  };

  const {
    uploading,
    uploadSuccess,
    currentIpfsLink,
    minting,
    minted,
    description,
    title,
  } = uploadState;

  return (
    <div className="w-full container bg-gradient-to-br from-orange-200 via-blue-200 to-purple-300 min-h-screen max-w-screen-2xl p-10">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <header className="flex justify-between items-center bg-white rounded-lg drop-shadow-sm hover:drop-shadow-md p-5 ">
          <div className="flex items-center space-x-2">
            <FileUp className="text-blue-600 w-6 h-6" />
            <h1 className="text-xl font-semibold">Create NFT from Records</h1>
          </div>
          <ConnectButton
            client={client}
            wallets={wallets}
            connectButton={{ label: "Connect Wallet" }}
          />
        </header>

        <Card>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-6 text-center cursor-pointer ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <CloudUploadOutlined className="text-4xl text-blue-600 mb-4" />
            <Paragraph>Drag & Drop your Document</Paragraph>
            <Paragraph className="text-gray-600 text-sm">
              Only PDF files supported
            </Paragraph>
          </div>

          {uploadSuccess && (
            <Input
              placeholder="Enter a title"
              value={title}
              onChange={(e) =>
                setUploadState((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="mt-4 p-3"
            />
          )}
          {uploadSuccess && (
            <Input
              placeholder="Enter a description"
              value={description}
              onChange={(e) =>
                setUploadState((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="mt-4"
            />
          )}
        </Card>

        {uploading && (
          <Card>
            <Paragraph>Uploading your document...</Paragraph>
          </Card>
        )}

        {uploadSuccess &&
          currentIpfsLink &&
          !minting &&
          !minted &&
          description &&
          title && (
            <Button type="primary" onClick={mintNFTCall} className="w-full">
              Mint NFT
            </Button>
          )}

        {minting && (
          <Card>
            <Paragraph>Minting your NFT...</Paragraph>
          </Card>
        )}

        {minted && (
          <Card>
            <Space>
              <CheckCircleOutlined className="text-green-600" />
              <Paragraph>
                Your document has been successfully converted to an NFT!
              </Paragraph>
            </Space>
          </Card>
        )}
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
      </Space>
    </div>
  );
}
