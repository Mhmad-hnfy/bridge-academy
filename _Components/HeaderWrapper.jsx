"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();

  // Do not render the main website Header on any admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <Header />;
}
