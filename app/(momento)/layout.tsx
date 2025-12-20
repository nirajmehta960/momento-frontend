"use client";

import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Topbar from "@/components/shared/Topbar";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MomentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPostDetailsPage = pathname.startsWith("/posts/");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full">
      <LeftSidebar />
      <div className="flex-1 md:ml-[80px] lg:ml-[300px] transition-all w-full">
        <Topbar />
        <section className="flex flex-1 md:h-screen min-h-[100vh] w-full pb-20 md:pb-0">
          <div
            className={`flex flex-1 ${
              isPostDetailsPage ? "" : "justify-center"
            }`}
          >
            <div className={`w-full ${isPostDetailsPage ? "" : "max-w-5xl"}`}>
              {children}
            </div>
          </div>
        </section>
        <Bottombar />
      </div>
    </div>
  );
}
