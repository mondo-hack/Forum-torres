import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import CreatePost from "@/components/forum/CreatePost";
import PostList from "@/components/forum/PostList";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getUser } from "@/lib/storage";

export default function Forum() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const user = getUser();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to like post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Forum Discussions</h1>
        {user && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreatePost onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <PostList
            posts={posts}
            isLoading={isLoading}
            onLike={(postId) => likeMutation.mutate(postId)}
          />
        </ScrollArea>
      </Card>
    </div>
  );
}
