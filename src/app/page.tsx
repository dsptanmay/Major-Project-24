"use client";

import {
  Shield,
  ArrowRight,
  Database,
  FileKey,
  Clock,
  Share2,
  Users,
  LogOut,
  LogIn,
} from "lucide-react";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import Link from "next/link";

const LandingPage = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="fixed w-full top-0 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">
                NFT Based Health Records
              </span>
            </div>
            <nav className="flex items-center space-x-6">
              {isSignedIn && (
                <Link
                  href={""}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Dashboard
                </Link>
              )}

              {!isSignedIn && (
                <Link href={"/sign-in"}>
                  <button className="flex justify-between items-center space-x-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-green-600 transition-all">
                    <LogIn />
                    <span>Sign In</span>
                  </button>
                </Link>
              )}
              {isSignedIn && (
                <SignOutButton redirectUrl="/">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-red-600 transition-all">
                    <LogOut className="" />
                    <span>Sign Out</span>
                  </button>
                </SignOutButton>
              )}
            </nav>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Secure Patient Health Records
            <br />
            Powered by NFT Technology
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Revolutionary healthcare data management system that puts patients
            in control while ensuring security and interoperability.
          </p>
          <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileKey className="w-8 h-8" />,
                title: "Secure Ownership",
                description:
                  "Patient health records are tokenized as NFTs, ensuring true ownership and control",
              },
              {
                icon: <Database className="w-8 h-8" />,
                title: "Immutable Records",
                description:
                  "Blockchain technology ensures records cannot be altered or tampered with",
              },
              {
                icon: <Share2 className="w-8 h-8" />,
                title: "Easy Sharing",
                description:
                  "Securely share your health records with healthcare providers instantly",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-indigo-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "Create Account",
                description: "Sign up and verify your identity",
              },
              {
                icon: <FileKey className="w-8 h-8" />,
                title: "Upload Records",
                description: "Securely upload your health records",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "NFT Generation",
                description: "Records are converted to NFTs",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Instant Access",
                description: "Access or share records anytime",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
