import {
  users,
  messages,
  posts,
  comments,
  type User,
  type Message,
  type Post,
  type Comment,
  type InsertUser,
  type InsertMessage,
  type InsertPost,
  type InsertComment,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  setUserOnline(id: number, isOnline: boolean): Promise<void>;
  getOnlineUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  getUserStats(id: number): Promise<{
    messageCount: number;
    postCount: number;
  }>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChannel(channelId: string): Promise<Message[]>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  likePost(id: number): Promise<Post>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private currentIds: {
    user: number;
    message: number;
    post: number;
    comment: number;
  };

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.currentIds = {
      user: 1,
      message: 1,
      post: 1,
      comment: 1,
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = {
      ...insertUser,
      id,
      isOnline: false,
      isAdmin: insertUser.username === "mondo", // Set admin for username 'mondo'
    };
    this.users.set(id, user);
    return user;
  }

  async setUserOnline(id: number, isOnline: boolean): Promise<void> {
    const user = await this.getUser(id);
    if (user) {
      this.users.set(id, { ...user, isOnline });
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.isOnline);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<void> {
    if (!this.users.has(id)) {
      throw new Error("User not found");
    }
    this.users.delete(id);
  }

  async getUserStats(
    id: number,
  ): Promise<{ messageCount: number; postCount: number }> {
    const messages = Array.from(this.messages.values()).filter(
      (m) => m.userId === id,
    );
    const posts = Array.from(this.posts.values()).filter(
      (p) => p.userId === id,
    );

    return {
      messageCount: messages.length,
      postCount: posts.length,
    };
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const message: Message = {
      ...insertMessage,id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByChannel(channelId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((msg) => msg.channelId === channelId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentIds.post++;
    const post: Post = {
      ...insertPost,
      id,
      likes: 0,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async likePost(id: number): Promise<Post> {
    const post = this.posts.get(id);
    if (!post) throw new Error("Post not found");
    const updatedPost = { ...post, likes: post.likes + 1 };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentIds.comment++;
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = new MemStorage();
