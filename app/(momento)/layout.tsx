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
  const isMessagesPage = pathname.startsWith("/messages");
  const isChatPage = pathname.startsWith("/messages/") && pathname !== "/messages";
  const isPostDetailsPage = pathname.startsWith("/posts/");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full">
      <LeftSidebar />
      <div className="flex flex-col flex-1 md:ml-[80px] lg:ml-[300px] transition-all w-full">
        <Topbar />
        <section className="flex flex-1 md:h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] w-full pb-20 md:pb-0">
          <div
            className={`flex flex-1 ${
              isChatPage || isPostDetailsPage ? "" : "justify-center"
            }`}
          >
            <div className={`w-full ${isChatPage || isPostDetailsPage ? "" : "max-w-5xl"}`}>
              {children}
            </div>
          </div>
        </section>
        <Bottombar />
      </div>
    </div>
  );
}
