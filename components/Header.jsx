"use client";
import { useStoreUser } from "@/hooks/use-store-user";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { BarLoader } from "react-spinners";
const Header = () => {
  const { isLoading } = useStoreUser();
  const path = usePathname();
  return (
    <header
      className="fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50
     supports-[backdrop-filter]:bg-white/60"
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={"/logos/logo.png"}
            alt="logo"
            height={60}
            width={200}
            className="h-11 w-auto object-contain"
          />
        </Link>

        {path === "/" && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium hover:text-green-600 transition"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-green-600 transition"
            >
              How It Works
            </Link>
          </div>
        )}
      </nav>

      {isLoading && <BarLoader width={"100%"} color="#36d7b7" />}
    </header>
  );
};

export default Header;
