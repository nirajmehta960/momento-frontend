"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";

const MessagesPage = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useUserContext();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/sign-in");
      } else {
        router.push("/messages/ai");
      }
    }
  }, [authLoading, isAuthenticated, router]);

  return (
    <div className="flex-center w-full h-full">
      <Loader />
    </div>
  );
};

export default MessagesPage;
