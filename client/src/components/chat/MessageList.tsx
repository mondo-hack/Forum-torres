import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { getUser } from "@/lib/storage";

interface MessageListProps {
  messages: any[];
}

export default function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = getUser();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ScrollArea className="h-full p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isCurrentUser = currentUser?.id === message.userId;

          return (
            <div
              key={index}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>

                <Card className={`p-3 ${isCurrentUser ? "bg-primary text-primary-foreground" : ""}`}>
                  {message.fileUrl ? (
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        View Attachment
                      </a>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <div className={`text-xs mt-1 ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
