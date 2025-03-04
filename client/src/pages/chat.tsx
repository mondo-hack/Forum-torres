import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import ChatWindow from "@/components/chat/ChatWindow";
import { useWebSocket } from "@/hooks/use-websocket";
import { getUser } from "@/lib/storage";

const CHANNELS = [
  { id: "general", name: "Umum" },
  { id: "random", name: "Acak" },
  { id: "help", name: "Bantuan" }
];

interface Message {
  type: string;
  data: {
    userId: number;
    isOnline: boolean;
  };
}

export default function Chat() {
  const [location] = useLocation();
  const user = getUser();
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const { sendMessage, subscribe } = useWebSocket();

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Set user sebagai online
    sendMessage({
      type: "userStatus",
      data: {
        userId: user.id,
        isOnline: true
      }
    } as Message);

    // Subscribe ke pesan WebSocket
    subscribe((message) => {
      if (message.type === "onlineUsers") {
        setOnlineUsers(message.data);
      }
    });

    // Cleanup
    return () => {
      sendMessage({
        type: "userStatus",
        data: {
          userId: user.id,
          isOnline: false
        }
      } as Message);
    };
  }, [user, sendMessage, subscribe]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Channel</h2>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {CHANNELS.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg ${selectedChannel === channel.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  }`}
                >
                  # {channel.name}
                </button>
              ))}
            </div>
          </ScrollArea>

          <h2 className="text-lg font-semibold mt-6 mb-4">Pengguna Online</h2>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{user.username}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      <div className="md:col-span-3">
        <ChatWindow channelId={selectedChannel} />
      </div>
    </div>
  );
}
