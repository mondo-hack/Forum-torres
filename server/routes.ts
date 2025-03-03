import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema, insertPostSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connection handling
  wss.on('connection', (ws) => {
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'message':
            const newMessage = await storage.createMessage(message.data);
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'message', data: newMessage }));
              }
            });
            break;

          case 'userStatus':
            await storage.setUserOnline(message.data.userId, message.data.isOnline);
            const onlineUsers = await storage.getOnlineUsers();
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'onlineUsers', data: onlineUsers }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });
  });

  // User routes
  app.post('/api/users/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse({
        ...req.body,
        isAdmin: req.body.username === 'mondo' // Set admin for username 'mondo'
      });
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: 'Data pengguna tidak valid' });
    }
  });

  app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);

    if (user && user.password === password) {
      res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.});
    } else {
      res.status(401).json({ error: 'Username atau password salah' });
    }
  });

  // Admin routes
  app.get('/api/users', async (req, res) => {
    const reqUser = await storage.getUser(parseInt(req.query.userId as string));
    if (!reqUser?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post('/api/users/:id/kick', async (req, res) => {
    const reqUser = await storage.getUser(parseInt(req.query.userId as string));
    if (!reqUser?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    try {
      await storage.deleteUser(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }
  });

  // User stats route
  app.get('/api/users/stats', async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    try {
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(404).json({ error: 'Statistik tidak ditemukan' });
    }
  });

  // Post routes
  app.get('/api/posts', async (_req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ error: 'Data post tidak valid' });
    }
  });

  app.post('/api/posts/:id/like', async (req, res) => {try {
      const post = await storage.likePost(parseInt(req.params.id));
      res.json(post);
    } catch (error) {
      res.status(404).json({ error: 'Post tidak ditemukan' });
    }
  });

  // Comment routes
  app.get('/api/posts/:id/comments', async (req, res) => {
    const comments = await storage.getCommentsByPost(parseInt(req.params.id));
    res.json(comments);
  });

  app.post('/api/comments', async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ error: 'Data komentar tidak valid' });
    }
  });

  return httpServer;
}
