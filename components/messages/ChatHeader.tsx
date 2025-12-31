"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";

interface ChatHeaderProps {
  userName: string;
  userImage: string;
  isAI?: boolean;
  onBack?: () => void;
  userId?: string;
  lastLogin?: string | Date | null;
}

const isUserActive = (lastLogin: string | Date | null | undefined): boolean => {
  if (!lastLogin) {
    return false;
  }
  const loginDate = new Date(lastLogin);
  const now = new Date();
  const diffInMs = now.getTime() - loginDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  // User is considered active if they logged in within the last 2 minutes
  return diffInMinutes < 2;
};

const formatLastLogin = (
  lastLogin: string | Date | null | undefined
): string => {
  if (!lastLogin) {
    return "Never logged in";
  }

  const loginDate = new Date(lastLogin);
  const now = new Date();
  const diffInMs = now.getTime() - loginDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "Active now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else {
    return loginDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        loginDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};

const ChatHeader = ({
  userName,
  userImage,
  isAI = false,
  onBack,
  userId,
  lastLogin,
}: ChatHeaderProps) => {
  const isActive = isUserActive(lastLogin);

  const ProfileContent = () => (
    <>
      <div className="relative">
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={userImage || "/assets/icons/profile-placeholder.svg"}
          alt={userName}
        />
          <AvatarFallback className="bg-primary text-primary-foreground">
          {userName
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
        {(isAI || isActive) && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
        )}
      </div>
      <div>
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          {userName}
          {isAI && <Check className="h-4 w-4 text-primary" />}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isAI ? "Online" : isActive ? "Online" : formatLastLogin(lastLogin)}
        </p>
      </div>
    </>
  );

  return (
    <div className="p-6 border-b border-border bg-dark-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-card rounded-full transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              />
            </svg>
          </button>
        )}
        {!isAI && userId ? (
          <Link
            href={`/profile/${userId}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <ProfileContent />
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <ProfileContent />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
