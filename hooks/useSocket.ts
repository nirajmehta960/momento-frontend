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
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("new-message");
        socketRef.current.off("messages-read");
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

