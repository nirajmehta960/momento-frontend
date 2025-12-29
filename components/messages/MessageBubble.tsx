"use client";
import { IMessage } from "@/types";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface MessageBubbleProps {
  message: IMessage;
  isAI?: boolean;
  senderImage?: string;
  currentUserImage?: string;
}

const MessageBubble = ({
  message,
  isAI = false,
  senderImage,
  currentUserImage,
}: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const [imageError, setImageError] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: false,
  });

  const handleDownloadImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!message.imageUrl) return;

    try {
      if (message.imageUrl.startsWith("data:image")) {
        const link = document.createElement("a");
        link.href = message.imageUrl;
        link.download = `momento-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        fetch(message.imageUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `momento-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          })
          .catch(() => {
            window.open(message.imageUrl || "", "_blank");
          });
      }
    } catch (error) {
      window.open(message.imageUrl || "", "_blank");
    }
  };

  const handleImageClick = () => {
    if (message.imageUrl && !imageError) {
      setIsImageModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsImageModalOpen(false);
  };

  const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isImageModalOpen) {
        handleCloseModal();
      }
    };

    if (isImageModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isImageModalOpen]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`group flex flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`flex items-center gap-2 ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div
            className={`px-4 py-2 rounded-2xl max-w-md ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground border border-border"
            }`}
          >
            {message.imageUrl && !imageError && (
              <div className="mb-3 relative group">
                <img
                  src={message.imageUrl}
                  alt="Generated image"
                  className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onError={() => setImageError(true)}
                  onClick={handleImageClick}
                  style={{ maxWidth: "400px", width: "100%" }}
                />
                <button
                  onClick={handleDownloadImage}
                  className="absolute top-2 right-2 bg-card/90 hover:bg-card text-foreground px-3 py-1.5 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10"
                  title="Download image"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            )}

            {message.content && (
              <div className="text-sm">
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className={`${
                          isUser
                            ? "text-blue-100 hover:text-white"
                            : "text-blue-400 hover:text-blue-300"
                        } underline`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        {...props}
                        className="list-disc list-inside space-y-1 my-2"
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        {...props}
                        className="list-decimal list-inside space-y-1 my-2"
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li {...props} className="ml-2" />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong {...props} className="font-bold" />
                    ),
                    em: ({ node, ...props }) => (
                      <em {...props} className="italic" />
                    ),
                    p: ({ node, ...props }) => (
                      <p {...props} className="mb-2 last:mb-0" />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {timeAgo === "less than a minute" ? "Now" : timeAgo}
        </span>
      </div>

      {isImageModalOpen && message.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={handleModalBackdropClick}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 bg-card/90 hover:bg-card text-foreground p-2 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={handleDownloadImage}
              className="absolute top-4 right-16 z-10 bg-card/90 hover:bg-card text-foreground px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              title="Download image"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            <img
              src={message.imageUrl}
              alt="Generated image - full size"
              className="max-w-full max-h-[95vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
