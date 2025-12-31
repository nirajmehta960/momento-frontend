"use client";
import { useState, useRef, useEffect } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Send } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
      setShowEmojiPicker(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="p-6 border-t border-border bg-dark-3">
      <div className="flex items-center gap-3">
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" className="flex-shrink-0">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-0 bg-transparent shadow-none"
            side="top"
            align="start"
            >
              <div className="w-[280px] sm:w-[320px] md:w-[350px]">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={Theme.DARK}
                  width="100%"
                  height={350}
                  previewConfig={{ showPreview: false }}
                  skinTonesDisabled
                />
              </div>
          </PopoverContent>
        </Popover>
        <Input
          ref={inputRef}
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          disabled={isLoading}
          className="bg-card border-border text-foreground"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
