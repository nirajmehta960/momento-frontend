"use client";

import React, { useEffect } from "react";
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/lib/react-query/queriesAndMutation";
import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, UserPlus, MessageSquare, X } from "lucide-react";

const Notifications = () => {
  const { data: notificationsData, isLoading } = useGetNotifications();
  const { isAuthenticated, isLoading: isAuthLoading } = useUserContext();
  const router = useRouter();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  const { mutate: deleteNotif } = useDeleteNotification();
  const [deletingIds, setDeletingIds] = React.useState<Set<string>>(new Set());
  const notificationsRef = React.useRef<any[]>([]);

  const notifications =
    (notificationsData as any)?.documents ||
    (Array.isArray(notificationsData) ? notificationsData : []);

  React.useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    return () => {
      if (isAuthenticated && notificationsRef.current.length > 0) {
        const hasUnread = notificationsRef.current.some((n: any) => !n.read);
        if (hasUnread) {
          markAllAsRead();
        }
      }
    };
  }, [isAuthenticated, markAllAsRead]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return (
          <Heart
            className="w-4 h-4"
            fill="#ef4444"
            stroke="none"
            strokeWidth={0}
          />
        );
      case "FOLLOW":
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "REVIEW":
        return <MessageSquare className="w-4 h-4 text-yellow-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: any) => {
    const actorName = notification.actor?.name || "Someone";
    const actorUsername = notification.actor?.username || "";

    switch (notification.type) {
      case "LIKE":
        return (
          <>
            <span className="font-semibold">{actorName}</span> liked your post
          </>
        );
      case "FOLLOW":
        return (
          <>
            <span className="font-semibold">{actorName}</span> started following
            you
          </>
        );
      case "REVIEW":
        return (
          <>
            <span className="font-semibold">{actorName}</span> reviewed your
            post
          </>
        );
      default:
        return "New notification";
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.type === "FOLLOW") {
      return `/profile/${
        notification.actor?._id || notification.actor?.id || notification.actor
      }`;
    }
    if (notification.post) {
      return `/posts/${
        notification.post._id || notification.post.id || notification.post
      }`;
    }
    return "#";
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification._id || notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotif(notificationId);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="notifications-container">
      <div className="flex-between w-full max-w-5xl mb-6">
        <div className="flex gap-2 items-center">
          <img
            src="/assets/icons/bell.svg"
            width={36}
            height={36}
            alt="notifications"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left">Notifications</h2>
        </div>
        {notifications.length > 0 && (
          <Button
            onClick={() => markAllAsRead()}
            variant="outline"
            className="text-light-1 border-dark-4 hover:bg-dark-4"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex-center w-full py-10">
          <Loader />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-center flex-col gap-4 py-20">
          <img
            src="/assets/icons/bell.svg"
            width={80}
            height={80}
            alt="no notifications"
            className="opacity-50 invert-white"
          />
          <p className="text-light-3 text-center">No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full max-w-5xl">
          {notifications.map((notification: any) => {
            const notificationId = notification._id || notification.id;
            const isUnread = !notification.read;
            const link = getNotificationLink(notification);
            const isDeleting = deletingIds.has(notificationId);
            const hasPostImage =
              notification.post?.imageUrl &&
              (notification.type === "LIKE" || notification.type === "REVIEW");

            return (
              <div
                key={notificationId}
                className={`relative transition-all duration-300 ${
                  isDeleting
                    ? "opacity-50 bg-dark-1 scale-95"
                    : isUnread
                    ? "bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30"
                    : "bg-dark-2 hover:bg-dark-1 border border-dark-4"
                } rounded-lg`}
              >
                <Link
                  href={link}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex items-center gap-3 p-3 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={
                        notification.actor?.imageUrl ||
                        "/assets/icons/profile-placeholder.svg"
                      }
                      alt={notification.actor?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {notification.type === "LIKE" ? (
                        <Heart
                          className="w-4 h-4 flex-shrink-0"
                          fill="#ef4444"
                          stroke="none"
                          strokeWidth={0}
                        />
                      ) : (
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                      <p
                        className={`text-sm ${
                          isUnread
                            ? "text-light-1 font-semibold"
                            : "text-light-3 font-normal"
                        }`}
                      >
                        {getNotificationMessage(notification)}
                      </p>
                    </div>
                    <p className="text-light-3 text-xs mt-0.5">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {hasPostImage && (
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <img
                        src={notification.post.imageUrl}
                        alt="Post"
                        className="w-14 h-14 rounded-md object-cover"
                      />
                    </div>
                  )}
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeletingIds((prev) => new Set(prev).add(notificationId));
                    setTimeout(() => {
                      handleDelete(e, notificationId);
                      setDeletingIds((prev) => {
                        const next = new Set(prev);
                        next.delete(notificationId);
                        return next;
                      });
                    }, 200);
                  }}
                  className="absolute top-2 right-2 flex-shrink-0 p-1.5 hover:bg-dark-4 rounded-full transition-colors z-10"
                  aria-label="Delete notification"
                >
                  <X className="w-4 h-4 text-light-3 hover:text-light-1" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
