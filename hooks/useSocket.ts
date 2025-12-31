import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "@/context/AuthContext";
import { getSocket, disconnectSocket } from "@/lib/api/socket";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

export const useSocket = () => {
  const { user, isAuthenticated } = useUserContext();
  const queryClient = useQueryClient();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || typeof window === "undefined") {
      return;
    }

    // Initialize socket (may be async, so we'll set up listeners after it's ready)
    const initializeSocket = async () => {
      try {
        // Use async getter to ensure socket is ready
        const { getSocketAsync } = await import("@/lib/api/socket");
        const socket = await getSocketAsync(user.id);
        
        if (socket) {
          // Wait for socket to be connected
          if (socket.connected) {
            setupSocketListeners(socket);
          } else {
            socket.once("connect", () => {
      setupSocketListeners(socket);
            });
          }
        }
      } catch (error) {
        // Socket will retry automatically
      }
    };

    const setupSocketListeners = (socket: any) => {
      socketRef.current = socket;

      // Listen for new messages
      socket.on("new-message", (message: any) => {
        // Determine the conversation partner ID
        // If user sent the message, the partner is the receiver
        // If user received the message, the partner is the sender
        const partnerId =
        message.senderId === user.id ? message.receiverId : message.senderId;

        // Update the conversation cache if it exists
      queryClient.setQueryData(
          QUERY_KEYS.GET_USER_CONVERSATION(partnerId),
        (old: any) => {
            if (!old) {
              // If conversation doesn't exist yet, create it
              return {
                messages: [message],
              };
            }
          const messages = old.messages || [];
            // Check if message already exists (avoid duplicates from optimistic updates or multiple events)
            const exists = messages.some(
              (m: any) => m._id === message._id || (m._id?.startsWith("temp-") && m.content === message.content && m.senderId === message.senderId)
            );
            if (exists) {
              // Replace optimistic message with real one
              return {
                ...old,
                messages: messages.map((m: any) =>
                  m._id?.startsWith("temp-") && m.content === message.content && m.senderId === message.senderId
                    ? message
                    : m
                ),
              };
            }
          return {
            ...old,
            messages: [...messages, message],
          };
        }
      );

        // Optimistically update conversation partners list with new message
        queryClient.setQueryData(
          [QUERY_KEYS.GET_CONVERSATION_PARTNERS],
          (old: any) => {
            if (!old || !old.partners) {
              // If no existing data, create new structure
              const isReceivedMessage = message.senderId !== user.id;
              const newPartner = {
                partnerId,
                lastMessageTime: message.createdAt,
                lastMessageContent: message.content,
                lastMessageSenderId: message.senderId,
                unreadCount: isReceivedMessage ? 1 : 0,
              };
              
              // Update unread count (count of conversations with unread messages)
              queryClient.setQueryData(
                [QUERY_KEYS.GET_UNREAD_MESSAGE_COUNT],
                isReceivedMessage ? 1 : 0
              );
              
              return {
                partners: [newPartner],
              };
            }
            
            const partners = [...old.partners];
            const partnerIndex = partners.findIndex(
              (p: any) => p.partnerId === partnerId
            );

            const previousUnreadCount = partners[partnerIndex]?.unreadCount || 0;
            const isReceivedMessage = message.senderId !== user.id;
            const newUnreadCount = isReceivedMessage
              ? previousUnreadCount + 1
              : previousUnreadCount;

            const updatedPartner = {
              partnerId,
              lastMessageTime: message.createdAt,
              lastMessageContent: message.content,
              lastMessageSenderId: message.senderId,
              unreadCount: newUnreadCount,
            };

            let newPartners: any[];
            if (partnerIndex >= 0) {
              // Remove old partner and add updated one at the top
              // Create new objects for all partners to ensure React Query detects changes
              newPartners = [
                { ...updatedPartner }, // New object reference
                ...partners
                  .filter((p: any) => p.partnerId !== partnerId)
                  .map((p: any) => ({ ...p })) // Create new object references
              ];
            } else {
              // Add new partner at the top
              newPartners = [
                { ...updatedPartner }, // New object reference
                ...partners.map((p: any) => ({ ...p })) // Create new object references
              ];
            }

            // Count number of conversations with unread messages (not total messages)
            const conversationsWithUnread = newPartners.filter(
              (p: any) => (p.unreadCount || 0) > 0
            ).length;

            // Update unread count
            queryClient.setQueryData(
              [QUERY_KEYS.GET_UNREAD_MESSAGE_COUNT],
              conversationsWithUnread
            );

            return {
              partners: newPartners,
            };
          }
        );
      });

      // Listen for messages being read
      socket.on("messages-read", (data: { readBy: string }) => {
        // Invalidate conversation to refresh read status
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_USER_CONVERSATION(data.readBy),
        });
      });

      // Listen for new notifications
      socket.on("new-notification", (notification: any) => {
        // Optimistically add notification to the list
        queryClient.setQueryData(
          [QUERY_KEYS.GET_NOTIFICATIONS],
          (old: any) => {
            if (!old || !old.documents) {
              return { documents: [notification] };
            }
            // Check if notification already exists
            const exists = old.documents.some(
              (n: any) => n._id === notification._id
            );
            if (exists) {
              return old;
            }
            // Add new notification at the beginning
            return {
              ...old,
              documents: [notification, ...old.documents],
            };
          }
        );
      });

      // Listen for notification count updates
      socket.on("notification-count-updated", () => {
        // Optimistically increment unread notification count
        queryClient.setQueryData(
          [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
          (old: any) => {
            const currentCount = typeof old === "number" ? old : old?.count || 0;
            return currentCount + 1;
          }
        );
        
        // Also invalidate to sync with server
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_UNREAD_NOTIFICATION_COUNT],
        });
      });

      // Listen for post like updates
      socket.on("post-liked", (data: { postId: string; likes: string[]; post: any }) => {
        // Update post in cache with new likes
        queryClient.setQueryData(
          QUERY_KEYS.GET_POST_BY_ID(data.postId),
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              likes: data.likes,
            };
          }
        );

        // Invalidate post lists to refresh like counts
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        });
      });

      // Listen for new reviews
      socket.on("new-review", (data: { postId: string; review: any }) => {
        // Optimistically add review to the list
        queryClient.setQueryData(
          QUERY_KEYS.GET_REVIEWS_BY_POST(data.postId),
          (old: any) => {
            if (!old || !old.documents) {
              return { documents: [data.review] };
            }
            // Check if review already exists
            const exists = old.documents.some(
              (r: any) => r._id === data.review._id
            );
            if (exists) {
              return old;
            }
            // Add new review at the beginning
            return {
              ...old,
              documents: [data.review, ...old.documents],
            };
          }
        );
      });

      // Listen for follow/unfollow updates
      socket.on("follow-updated", (data: { userId: string; action: "follow" | "unfollow"; followerId?: string; followingId?: string }) => {
        // Invalidate followers and following lists for real-time updates
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_FOLLOWERS(data.userId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_FOLLOWING(data.userId),
        });
        
        // Also invalidate messagable users if it's the current user
        if (data.userId === user.id) {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.GET_MESSAGABLE_USERS(data.userId),
          });
        }
        
        // Invalidate user profile to update follower/following counts
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.GET_USER_BY_ID(data.userId),
        });
      });

      // Listen for new posts from users you follow
      socket.on("new-post", (post: any) => {
        // Optimistically add post to the beginning of post lists
        queryClient.setQueryData(
          [QUERY_KEYS.GET_RECENT_POSTS],
          (old: any) => {
            if (!old || !old.documents) {
              return { documents: [post] };
            }
            // Check if post already exists
            const exists = old.documents.some(
              (p: any) => (p._id || p.id || p.$id) === (post._id || post.id || post.$id)
            );
            if (exists) {
              return old;
            }
            // Add new post at the beginning
            return {
              ...old,
              documents: [post, ...old.documents],
            };
          }
        );
        
        // Also invalidate to ensure consistency
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_POSTS],
        });
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        });
      });
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("new-message");
        socketRef.current.off("messages-read");
        socketRef.current.off("new-notification");
        socketRef.current.off("notification-count-updated");
        socketRef.current.off("post-liked");
        socketRef.current.off("new-review");
        socketRef.current.off("follow-updated");
        socketRef.current.off("new-post");
      }
    };
  }, [isAuthenticated, user?.id, queryClient]);

  // Disconnect on logout
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  return socketRef.current;
};

