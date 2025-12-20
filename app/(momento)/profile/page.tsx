"use client";

import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/shared/Loader";

export default function ProfileRedirect() {
  const { user, isAuthenticated, isLoading } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user.id) {
        router.replace(`/profile/${user.id}`);
      } else {
        router.replace("/sign-in");
      }
    }
  }, [isAuthenticated, isLoading, user.id, router]);

  return (
    <div className="flex-center w-full h-screen">
      <Loader />
    </div>
  );
}
