"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useSignOutAccount,
  useGetUnreadNotificationCount,
} from "@/lib/react-query/queriesAndMutation";
import { useUserContext } from "@/context/AuthContext";
import { sidebarLinks } from "@/constants";
import { INavLink } from "@/types";
import {
  Home,
  Compass,
  Users,
  Bookmark,
  PlusSquare,
  Bell,
  LogOut,
  Camera,
  Menu,
} from "lucide-react";

const iconMap: Record<string, any> = {
  "/": Home,
  "/explore": Compass,
  "/all-users": Users,
  "/notifications": Bell,
  "/saved": Bookmark,
  "/create-post": PlusSquare,
};

const LeftSidebar = () => {
  const pathname = usePathname();
  const { mutate: signOutMutation, isSuccess } = useSignOutAccount();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useUserContext();
  const { data: unreadCount } = useGetUnreadNotificationCount();
  const notificationCount = unreadCount || 0;

  useEffect(() => {
    if (isSuccess) {
      signOut().then(() => {
        router.push("/sign-in");
      });
    }
  }, [isSuccess, router, signOut]);

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[80px] lg:w-[300px] flex-col bg-dark-3 border-r border-dark-4 z-50 md:items-center lg:items-stretch">
      {/* Logo Section */}
      <div className="px-0 lg:px-6 pt-5 md:pt-4 pb-4 md:pb-3">
        <Link
          href="/"
          className="flex items-center lg:gap-3 justify-center lg:justify-start"
        >
          <div className="p-2 md:p-1.5 border border-white rounded-lg flex-shrink-0">
            <Camera className="h-6 w-6 md:h-6 md:w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <div className="hidden lg:flex flex-col justify-center">
            <span className="text-3xl font-bold text-white tracking-tight leading-tight">
              Momento
            </span>
            <span className="text-xs text-accent tracking-widest leading-tight">
              CAPTURE EVERY MOMENT
            </span>
          </div>
        </Link>
      </div>

      {/* User Profile Section */}
      {isAuthenticated && (
        <div className="px-0 lg:px-6 py-3 md:py-2 border-b border-dark-4">
          <Link
            href={`/profile/${user.id}`}
            className="flex items-center lg:gap-3 justify-center lg:justify-start"
          >
            <div className="w-10 h-10 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden lg:flex flex-1 min-w-0 flex-col">
              <p className="text-sm font-semibold text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-light-3 truncate">@{user.username}</p>
            </div>
          </Link>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-0 lg:px-3 py-3 md:py-2">
        <ul className="space-y-1 md:space-y-1">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;
            const isNotifications = link.route === "/notifications";
            const showNotificationBadge =
              isNotifications && notificationCount > 0;
            const IconComponent = iconMap[link.route] || Home;

            return (
              <li key={link.label}>
                <Link
                  href={link.route}
                  className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-4 px-0 lg:px-4 py-2.5 md:py-2 transition-all duration-200 relative ${
                    isActive
                      ? "md:w-12 md:h-12 md:mx-auto md:rounded-xl md:flex md:items-center md:justify-center lg:w-auto lg:h-auto lg:rounded-lg bg-white text-black font-semibold"
                      : "text-white md:w-12 md:h-12 md:mx-auto md:rounded-xl md:flex md:items-center md:justify-center lg:w-auto lg:h-auto lg:rounded-lg lg:hover:bg-dark-4"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <IconComponent
                      className="h-6 w-6 md:h-5 md:w-5 lg:h-6 lg:w-6"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {showNotificationBadge && (
                      <span className="absolute -top-1 -right-1 md:-top-1 md:-right-1 lg:-top-1.5 lg:-right-1.5 bg-blue-500 text-white text-[10px] md:text-[9px] lg:text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] md:min-w-[16px] lg:min-w-[18px] h-4.5 md:h-4 lg:h-4.5 px-1 md:px-0.5 lg:px-1">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline text-base">
                    {link.label}
                  </span>
                </Link>
              </li>
            );
          })}
          {isAuthenticated && user.role === "ADMIN" && (
            <li>
              <Link
                href="/admin"
                className={`flex items-center justify-center lg:justify-start gap-0 lg:gap-4 px-0 lg:px-4 py-2.5 md:py-2 transition-all duration-200 relative ${
                  pathname === "/admin"
                    ? "md:w-12 md:h-12 md:mx-auto md:rounded-xl md:flex md:items-center md:justify-center lg:w-auto lg:h-auto lg:rounded-lg bg-white text-black font-semibold"
                    : "text-white md:w-12 md:h-12 md:mx-auto md:rounded-xl md:flex md:items-center md:justify-center lg:w-auto lg:h-auto lg:rounded-lg lg:hover:bg-dark-4"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Menu
                    className="h-6 w-6 md:h-5 md:w-5 lg:h-6 lg:w-6"
                    strokeWidth={pathname === "/admin" ? 2.5 : 2}
                  />
                </div>
                <span className="hidden lg:inline text-base">Admin</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-0 lg:p-3 md:pb-2">
        {isAuthenticated ? (
          <button
            onClick={() => signOutMutation()}
            className="w-full flex items-center justify-center lg:justify-start gap-0 lg:gap-4 px-0 lg:px-4 py-2.5 md:py-2 md:w-12 md:h-12 md:mx-auto md:rounded-xl lg:w-full lg:h-auto lg:rounded-lg text-white hover:bg-dark-4 transition-all duration-200"
          >
            <LogOut
              className="h-6 w-6 md:h-5 md:w-5 lg:h-6 lg:w-6"
              strokeWidth={2}
            />
            <span className="hidden lg:inline text-base">Logout</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2 md:gap-1.5">
            <Link href="/sign-in" className="w-full">
              <button className="w-full flex items-center justify-center lg:justify-start gap-0 lg:gap-4 px-0 lg:px-4 py-2.5 md:py-2 md:w-12 md:h-12 md:mx-auto md:rounded-xl lg:w-full lg:h-auto lg:rounded-lg text-white hover:bg-dark-4 transition-all duration-200 border border-dark-4">
                <LogOut
                  className="h-6 w-6 md:h-5 md:w-5 lg:h-6 lg:w-6"
                  strokeWidth={2}
                />
                <span className="hidden lg:inline text-base">Sign-in</span>
              </button>
            </Link>
            <Link href="/sign-up" className="w-full">
              <button className="w-full flex items-center justify-center lg:justify-start gap-0 lg:gap-4 px-0 lg:px-4 py-2.5 md:py-2 md:w-12 md:h-12 md:mx-auto md:rounded-xl lg:w-full lg:h-auto lg:rounded-lg text-white hover:bg-dark-4 transition-all duration-200 border border-dark-4 bg-dark-4">
                <LogOut
                  className="h-6 w-6 md:h-5 md:w-5 lg:h-6 lg:w-6"
                  strokeWidth={2}
                />
                <span className="hidden lg:inline text-base">Sign-up</span>
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div className="px-0 lg:px-6 py-3 md:py-2 border-t border-dark-4 mt-2 md:mt-1">
        <div className="flex flex-col md:items-center lg:flex-row gap-2 md:gap-1.5 lg:gap-4 text-xs text-light-3">
          <Link
            href="/about"
            className="hover:text-white transition-colors text-center md:text-center lg:text-left"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="hover:text-white transition-colors text-center md:text-center lg:text-left"
          >
            <span className="hidden lg:inline">Privacy Policy</span>
            <span className="lg:hidden">Privacy</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
