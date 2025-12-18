import { bottombarLinks } from "@/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetUnreadNotificationCount } from "@/lib/react-query/queriesAndMutation";
import { useUserContext } from "@/context/AuthContext";
import { Home, Compass, Users, Bookmark, PlusSquare, Bell } from "lucide-react";

const iconMap: Record<string, any> = {
  "/": Home,
  "/explore": Compass,
  "/all-users": Users,
  "/notifications": Bell,
  "/saved": Bookmark,
  "/create-post": PlusSquare,
};

const Bottombar = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useUserContext();
  const { data: unreadCount } = useGetUnreadNotificationCount();
  const notificationCount = unreadCount || 0;

  return (
    <section className="bottom-bar">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        const isNotifications = link.route === "/notifications";
        const showNotificationBadge = isNotifications && notificationCount > 0;
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
                    notificationCount > 9 ? "min-w-[20px] h-5 px-1" : "w-4 h-4"
                  }`}
                >
                  {notificationCount && notificationCount > 9
                    ? "9+"
                    : notificationCount}
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
