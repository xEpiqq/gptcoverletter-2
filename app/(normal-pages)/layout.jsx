'use client';

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import "node_modules/react-modal-video/css/modal-video.css";
import "../../styles/index.css";
import app from "../../components/FirebaseApp";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as gtag from "../../lib/gtag";
import './globals.css'

export const metadata = {
  title: "GPTCoverLetter",
  description: "Generate cover letters for your job applications using GPT-3.5",

  type: "website",
  icons: {
    icon: "/logo_blue.svg",
    shortcut: "/logo_blue.svg",
  },

  // index the page
  robots: "index, follow",
};

export default function RootLayout({ children }) {


  
  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body className="">
        <Providers>
          <Header />
          {children}
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}

import { Providers } from "./providers";
