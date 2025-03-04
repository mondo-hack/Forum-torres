import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip } from "lucide-react";
import MessageList from "./MessageList";
import FileUpload from "../shared/FileUpload";
import { useWebSocket } from "@/hooks/use-websocket";
import { getUser, getChatMessages, saveChatMessages } from "@/lib/storage";

interface ChatWindowProps {
  channelId: string;
}

export default function ChatWindow({ channelId }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { sendMessage, subscribe } = useWebSocket();
  const user = getUser();

  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = getChatMessages(channelId);
    setMessages(savedMessages);

    // Subscribe to new messages
    subscribe((wsMessage) => {
      if (wsMessage.type === "message" && wsMessage.data.channelId === channelId) {
        setMessages((prev) => {
          const newMessages = [...prev, wsMessage.data];
          saveChatMessages(channelId, newMessages);
          return newMessages;
        });
      }
    });
  }, [channelId, subscribe]);

  const handleSend = () => {
    if (!message.trim() || !user) return;

    sendMessage({
      type: "message",
      data: {
        content: message,
        userId: user.id,
        channelId,
      },
    });

    setMessage("");
  };

  const handleFileUpload = (fileUrl: string) => {
    if (!user) return;

    sendMessage({
      type: "message",
      data: {
        content: "Shared a file",
        fileUrl,
        userId: user.id,
        channelId,
      },
    });

    setShowFileUpload(false);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)]"><div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>

      {showFileUpload && (
        <div className="p-4 border-t">
          <FileUpload onUpload={handleFileUpload} onCancel={() => setShowFileUpload(false)} />
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFileUpload(!showFileUpload)}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
