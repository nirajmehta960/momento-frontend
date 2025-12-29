"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetChatHistory,
  useSendMessage,
  useGetUserConversation,
  useSendUserMessage,
  useGetUserById,
  useMarkConversationAsRead,
} from "@/lib/react-query/queriesAndMutation";
import { useQueryClient } from "@tanstack/react-query";
import MessagesList from "@/components/messages/MessagesList";
import ChatHeader from "@/components/messages/ChatHeader";
import MessageBubble from "@/components/messages/MessageBubble";
import ChatInput from "@/components/messages/ChatInput";
import Loader from "@/components/shared/Loader";
import { IMessage, IUserConversation } from "@/types";
import { useSocket } from "@/hooks/useSocket";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";

const INITIAL_GREETING: IMessage = {
  _id: "greeting",
  userId: "ai",
  role: "assistant",
  content: "Hey! What's on your mind right now?",
  createdAt: new Date().toISOString(),
};

const ChatPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user, isAuthenticated, isLoading: authLoading } = useUserContext();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showMessagesList, setShowMessagesList] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        if (window.innerWidth >= 768) {
          setShowMessagesList(false);
        }
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!showMessagesList && window.innerWidth < 768) {
        document.body.classList.add("hide-bottombar");
      } else {
        document.body.classList.remove("hide-bottombar");
      }
      return () => {
        document.body.classList.remove("hide-bottombar");
      };
    }
  }, [showMessagesList]);
  const isAI = userId === "ai";
  const selectedUserId = isAI ? null : userId;

  // Initialize WebSocket connection (background, no UI changes)
  useSocket();

  const { data: chatData, isLoading: historyLoading } = useGetChatHistory();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { data: userConversationData, isLoading: conversationLoading } =
    useGetUserConversation(selectedUserId);
  const { mutate: sendUserMsg, isPending: isSendingUser } =
    useSendUserMessage();
  const { data: userData } = useGetUserById(selectedUserId || "");
  const { mutate: markAsRead } = useMarkConversationAsRead();

  const aiMessages = chatData?.messages || [];
  const userMessages =
    (userConversationData as IUserConversation | undefined)?.messages || [];
  const displayMessages = isAI
    ? aiMessages.length > 0
      ? aiMessages
      : [INITIAL_GREETING]
    : userMessages;

  const selectedUserName = isAI ? "Momento AI" : userData?.name || "User";
  const selectedUserImage = isAI
    ? "/assets/images/momento-ai-avatar.svg"
    : userData?.imageUrl || "/assets/icons/profile-placeholder.svg";

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, userMessages, isSending, isSendingUser]);

  useEffect(() => {
    if (
      !isAI &&
      selectedUserId &&
      isAuthenticated &&
      !conversationLoading &&
      userMessages.length > 0
    ) {
      markAsRead(selectedUserId);
    }
  }, [
    selectedUserId,
    isAI,
    isAuthenticated,
    conversationLoading,
    userMessages.length,
    markAsRead,
  ]);

  useEffect(() => {
    if (
      !isAI &&
      selectedUserId &&
      userConversationData &&
      !conversationLoading
    ) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.GET_UNREAD_MESSAGE_COUNT,
      });
    }
  }, [
    isAI,
    selectedUserId,
    userConversationData,
    conversationLoading,
    queryClient,
  ]);

  const handleBackToList = () => {
    setShowMessagesList(true);
  };

  const handleSend = (content: string) => {
    if (isAI) {
      sendMessage(content);
    } else {
      sendUserMsg({ receiverId: userId, content });
    }
  };

  if (authLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark-3">
      {/* Conversations List */}
      <div
        className={`${
          showMessagesList ? "flex" : "hidden lg:flex"
        } w-full lg:w-[400px] flex-shrink-0`}
      >
        <MessagesList selectedUserId={selectedUserId} />
      </div>

      {/* Chat Area */}
      <div
        className={`${
          showMessagesList ? "hidden lg:flex" : "flex"
        } flex-1 flex-col`}
      >
        {/* Chat Header */}
        <ChatHeader
          userName={selectedUserName}
          userImage={selectedUserImage}
          isAI={isAI}
          onBack={handleBackToList}
          userId={isAI ? undefined : userId}
          lastLogin={isAI ? undefined : userData?.lastLogin}
        />

        {/* Messages */}
        <ScrollArea className="flex-1 p-6 bg-dark-3">
          {(isAI ? historyLoading : conversationLoading) ? (
            <div className="flex-center w-full h-full">
              <Loader />
            </div>
          ) : displayMessages.length > 0 ? (
            <div className="space-y-4 max-w-3xl">
              {displayMessages.map((message: any) => {
                const isUserMessage = isAI
                  ? message.role === "user"
                  : message.senderId === user.id;
                const messageForBubble: IMessage = {
                  _id: message._id,
                  userId: message.userId || message.senderId,
                  role: isUserMessage ? "user" : "assistant",
                  content: message.content,
                  imageUrl: message.imageUrl || null,
                  feedback: message.feedback,
                  createdAt: message.createdAt,
                };
                const otherUserImage = isUserMessage
                  ? undefined
                  : isAI
                  ? undefined
                  : userData?.imageUrl ||
                    "/assets/icons/profile-placeholder.svg";
                const currentUserImage = isUserMessage
                  ? user?.imageUrl || "/assets/icons/profile-placeholder.svg"
                  : undefined;
                return (
                  <MessageBubble
                    key={message._id}
                    message={messageForBubble}
                    isAI={isAI && !isUserMessage}
                    senderImage={otherUserImage}
                    currentUserImage={currentUserImage}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex-center w-full h-full">
              <div className="text-center">
                <img
                  src={selectedUserImage}
                  alt={selectedUserName}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {selectedUserName}
                </h3>
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <ChatInput
          onSend={handleSend}
          isLoading={isAI ? isSending : isSendingUser}
        />
      </div>

      {/* Mobile: Show only conversation list or chat */}
      {showMessagesList && (
        <div className="flex-1 lg:hidden flex items-center justify-center p-6">
          <p className="text-muted-foreground">
            Select a conversation to start messaging
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
