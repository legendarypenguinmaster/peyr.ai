"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on workspace-hub pages
  if (pathname?.startsWith('/workspace-hub')) {
    return null;
  }
  
  return <Footer />;
}
