import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUser } from "@/lib/storage";

interface PostListProps {
  posts: any[];
  isLoading: boolean;
  onLike: (postId: number) => void;
}

export default function PostList({ posts, isLoading, onLike }: PostListProps) {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const user = getUser();

  if (isLoading) {
    return Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="mb-4">
        <CardHeader className="flex flex-row gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    ));
  }

  return (
    <div className="space-y-4 p-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar>
              <AvatarFallback>{post.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{post.title}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => user && onLike(post.id)}
                disabled={!user}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                {post.likes || 0}
              </Button>
              <Dialog open={selectedPost?.id === post.id} onOpenChange={(open) => !open && setSelectedPost(null)}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPost(post)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {post.comments?.length || 0}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <h2 className="text-lg font-semibold mb-4">Comments</h2>
                    {post.comments?.map((comment: any) => (
                      <Card key={comment.id} className="mb-2">
                        <CardContent className="py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {comment.username?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {comment.username}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
