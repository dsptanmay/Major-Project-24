"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button, message, Input, Typography, Card, Space } from "antd";
import {
  CloudUploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
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
import { FileText, FileUp, Home } from "lucide-react";

const { Title, Paragraph } = Typography;

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

  const { data: tokenID, isPending } = useReadContract({
    contract,
    method: "function nextTokenIdToMint() view returns (uint256)",
    params: [],
  });
  const onDrop = useCallback(async (acceptedFiles: Array<File>) => {
    const file = acceptedFiles[0];
    console.log(acceptedFiles);
    console.log(file);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Link
            href="/dashboard/user"
            className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex it6ems-center justify-between"
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
                <Home className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Home</h2>
                <p className="text-sm text-gray-600">Return to homepage</p>
              </div>
            </div>
          </Link>
        </div>

        {/* <Space>
          <Link href="/dashboard/user">
            <Button>Dashboard</Button>
          </Link>
          <Link href="/">
            <Button>Home</Button>
          </Link>
        </Space> */}
      </Space>
    </div>
  );
}
