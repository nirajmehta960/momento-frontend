"use client";
import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetUsers,
  useGetFollowing,
  useGetMessagableUsers,
  useGetConversationPartners,
  useMarkConversationAsRead,
} from "@/lib/react-query/queriesAndMutation";
import { useUserContext } from "@/context/AuthContext";
import { formatMessageTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Check } from "lucide-react";

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

interface MessagesListProps {
  selectedUserId: string | null;
}

const MessagesList = ({ selectedUserId }: MessagesListProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useUserContext();
  const { data: usersData } = useGetUsers();
  const { data: followingData } = useGetFollowing(currentUser?.id || "");
  const { data: messagableUsersData } = useGetMessagableUsers(
    currentUser?.id || ""
  );
  const { data: conversationPartnersData } = useGetConversationPartners();
  const { mutate: markAsRead } = useMarkConversationAsRead();

  const allUsers = usersData?.documents || [];
  const following = Array.isArray(followingData) ? followingData : [];
  const messagableUsers = messagableUsersData || [];
  const conversationPartners = conversationPartnersData?.partners || [];
  
  // Create a set of messagable user IDs for quick lookup
  const messagableUserIds = useMemo(() => {
    return new Set(
      messagableUsers.map((user: any) => user._id || user.id || user.$id)
    );
  }, [messagableUsers]);
  
  // Create a set of following user IDs for fallback search
  const followingIds = useMemo(() => {
    return new Set(
      following.map((user: any) => user._id || user.id || user.$id)
    );
  }, [following]);

  const partnerDataMap = useMemo(() => {
    const map = new Map();
    conversationPartners.forEach((partner: any) => {
      map.set(partner.partnerId, {
        lastMessageTime: partner.lastMessageTime,
        lastMessageContent: partner.lastMessageContent,
        lastMessageSenderId: partner.lastMessageSenderId,
        unreadCount: partner.unreadCount || 0,
      });
    });
    return map;
  }, [conversationPartners]);

  const filteredUsers = useMemo(() => {
    // Show ALL users with conversations (regardless of follow status)
    // This preserves chat history even if follow relationship changes
    const usersWithConversations = allUsers
      .filter((user: any) => {
        const userId = user.id || user._id || user.$id;
        return userId !== currentUser?.id && partnerDataMap.has(userId);
      })
      .map((user: any) => {
        const userId = user.id || user._id || user.$id;
        const partnerData = partnerDataMap.get(userId);
        return {
          ...user,
          id: userId,
          lastMessageTime: partnerData?.lastMessageTime,
          lastMessageContent: partnerData?.lastMessageContent,
          lastMessageSenderId: partnerData?.lastMessageSenderId,
          unreadCount: partnerData?.unreadCount || 0,
        };
      })
      .filter((user: any) => user.lastMessageTime);

    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      
      // Search ALL messagable users (following, followers, and mutual)
      // This includes users with and without existing conversations
      const allSearchedMessagable = messagableUsers
        .filter((user: any) => {
          const userId = user._id || user.id || user.$id;
          return (
            userId !== currentUser?.id &&
            (user.name?.toLowerCase().includes(searchLower) ||
              user.username?.toLowerCase().includes(searchLower))
          );
        })
        .map((user: any) => {
          const userId = user._id || user.id || user.$id;
          const partnerData = partnerDataMap.get(userId);
          return {
            ...user,
            id: userId,
            lastMessageTime: partnerData?.lastMessageTime || null,
            lastMessageContent: partnerData?.lastMessageContent || null,
            lastMessageSenderId: partnerData?.lastMessageSenderId || null,
            unreadCount: partnerData?.unreadCount || 0,
          };
        });

      // Fallback: Search in allUsers for users you're following (in case messagableUsers missed some)
      const searchedFollowing = allUsers
        .filter((user: any) => {
          const userId = user.id || user._id || user.$id;
          const isInMessagable = allSearchedMessagable.some(
            (m: any) => m.id === userId
          );
          return (
            userId !== currentUser?.id &&
            !isInMessagable &&
            followingIds.has(userId) &&
            !partnerDataMap.has(userId) &&
            (user.name?.toLowerCase().includes(searchLower) ||
              user.username?.toLowerCase().includes(searchLower))
          );
        })
        .map((user: any) => {
          const userId = user.id || user._id || user.$id;
          return {
            ...user,
            id: userId,
            lastMessageTime: null,
            lastMessageContent: null,
            lastMessageSenderId: null,
            unreadCount: 0,
          };
        });

      // Also search users with conversations that might not be in messagable list
      // (preserves chat history even if follow relationship changed)
      const searchedConversations = usersWithConversations
        .filter((user: any) => {
          const userId = user.id || user._id || user.$id;
          // Only include if not already in messagable results
          const isInMessagable = allSearchedMessagable.some(
            (m: any) => m.id === userId
          );
          return (
            !isInMessagable &&
            (user.name?.toLowerCase().includes(searchLower) ||
              user.username?.toLowerCase().includes(searchLower))
          );
        });

      // Combine: messagable users first (with conversations prioritized), then following fallback, then other conversations
      return [...allSearchedMessagable, ...searchedFollowing, ...searchedConversations].sort(
        (a: any, b: any) => {
          if (a.lastMessageTime && !b.lastMessageTime) return -1;
          if (!a.lastMessageTime && b.lastMessageTime) return 1;
          if (!a.lastMessageTime && !b.lastMessageTime) return 0;
          return (
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
          );
        }
      );
    }

    // When no search, show all users with conversations
    return usersWithConversations.sort((a: any, b: any) => {
      if (!a.lastMessageTime && !b.lastMessageTime) return 0;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return (
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
      );
    });
  }, [
    allUsers,
    following,
    followingIds,
    messagableUsers,
    messagableUserIds,
    conversationPartners,
    partnerDataMap,
    currentUser?.id,
    searchQuery,
  ]);

  return (
    <div className="w-full lg:w-[400px] border-r border-border bg-dark-3">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border text-foreground"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div
          onClick={() => router.push("/messages/ai")}
          className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border/50 ${
            selectedUserId === null ? "bg-card" : "hover:bg-card/50"
          }`}
        >
          <div className="relative">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src="/assets/images/momento-ai-avatar.svg"
                alt="Momento AI"
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                MA
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground truncate flex items-center gap-1">
                Momento AI
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              </h3>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              @momento_ai
            </p>
          </div>
        </div>

        {filteredUsers.map((user: any) => {
          const userIsActive = isUserActive(user.lastLogin);
          const hasUnread = user.unreadCount > 0;
          const isLastMessageFromUser =
            user.lastMessageSenderId === currentUser?.id;

          return (
            <div
              key={user.id}
              onClick={() => {
                if (user.unreadCount > 0) {
                  markAsRead(user.id);
                }
                router.push(`/messages/${user.id}`);
              }}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border/50 ${
                selectedUserId === user.id ? "bg-card" : "hover:bg-card/50"
              }`}
            >
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={
                      user.imageUrl || "/assets/icons/profile-placeholder.svg"
                    }
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {userIsActive && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`${
                      hasUnread ? "font-bold" : "font-semibold"
                    } text-foreground truncate`}
                  >
                    {user.name}
                  </h3>
                  {user.lastMessageTime && (
                    <span
                      className={`text-xs whitespace-nowrap ${
                        hasUnread
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatMessageTime(user.lastMessageTime)}
                    </span>
                  )}
                </div>
                {user.lastMessageContent ? (
                  <p
                    className={`text-sm truncate ${
                      hasUnread
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isLastMessageFromUser ? "You: " : ""}
                    {user.lastMessageContent}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
};

export default MessagesList;
