import { bottombarLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useGetUnreadNotificationCount,
  useGetUnreadMessageCount,
} from "@/lib/react-query/queriesAndMutation";
import { useUserContext } from "@/context/AuthContext";
import {
  Home,
  Compass,
  Users,
  Bookmark,
  PlusSquare,
  MessageCircle,
  Bell,
} from "lucide-react";

const iconMap: Record<string, any> = {
  "/": Home,
  "/explore": Compass,
  "/all-users": Users,
  "/messages": MessageCircle,
  "/notifications": Bell,
  "/saved": Bookmark,
  "/create-post": PlusSquare,
};

const Bottombar = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useUserContext();
  const { data: unreadCountData } = useGetUnreadNotificationCount();
  const unreadCount = unreadCountData || 0;
  const { data: unreadMessageCountData } = useGetUnreadMessageCount();
  const unreadMessageCount = isAuthenticated
    ? unreadMessageCountData ?? 0
    : 0;

  return (
    <section className="bottom-bar">
      {bottombarLinks.map((link) => {
        const isActive =
          link.route === "/messages"
            ? pathname.startsWith("/messages")
            : pathname === link.route;
        const isNotifications = link.route === "/notifications";
        const isMessages = link.route === "/messages";
        const showNotificationBadge = isNotifications && unreadCount > 0;
        const showMessageBadge = isMessages && unreadMessageCount > 0;
        const IconComponent = iconMap[link.route] || Home;

        return (
          <Link
            href={link.route}
            key={link.label}
            className="flex-center flex-col gap-1 transition group relative"
          >
            <div
              className={`relative flex items-center justify-center w-10 h-10 rounded-2xl ${
                isActive ? "bg-white text-black" : "text-white bg-transparent"
              }`}
            >
              <IconComponent
                className="h-6 w-6"
                strokeWidth={isActive ? 2.5 : 2}
              />
              {showNotificationBadge && (
                <span
                  className={`absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xl z-20 ${
                    unreadCount > 9 ? "min-w-[20px] h-5 px-1" : "w-4 h-4"
                  }`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {showMessageBadge && (
                <span
                  className={`absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xl z-20 ${
                    unreadMessageCount > 9 ? "min-w-[20px] h-5 px-1" : "w-4 h-4"
                  }`}
                >
                  {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;
