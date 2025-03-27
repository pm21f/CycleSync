import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCycleEntrySchema, 
  insertCommunityPostSchema,
  communityPosts
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create router for API routes
  const apiRouter = express.Router();

  // User routes
  apiRouter.post("/users/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  apiRouter.post("/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Cycle entry routes
  apiRouter.get("/cycle-entries", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const entries = await storage.getCycleEntries(userId);
      res.status(200).json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cycle entries" });
    }
  });

  apiRouter.get("/cycle-entries/date-range", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      if (!userId || !startDate || !endDate) {
        return res.status(400).json({ message: "User ID, start date and end date are required" });
      }
      
      const entries = await storage.getCycleEntriesByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      
      res.status(200).json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cycle entries" });
    }
  });

  apiRouter.get("/cycle-entries/by-date", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      const date = req.query.date as string;
      
      if (!userId || !date) {
        return res.status(400).json({ message: "User ID and date are required" });
      }
      
      const entry = await storage.getCycleEntryByDate(
        userId,
        new Date(date)
      );
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.status(200).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cycle entry" });
    }
  });

  apiRouter.post("/cycle-entries", async (req, res) => {
    try {
      const entryData = insertCycleEntrySchema.parse(req.body);
      const entry = await storage.createCycleEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create cycle entry" });
    }
  });

  apiRouter.put("/cycle-entries/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updateData = req.body;
      
      const updatedEntry = await storage.updateCycleEntry(id, updateData);
      
      if (!updatedEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.status(200).json(updatedEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cycle entry" });
    }
  });

  // Cycle prediction routes
  apiRouter.get("/cycle-predictions", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const predictions = await storage.getCyclePredictions(userId);
      res.status(200).json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cycle predictions" });
    }
  });

  apiRouter.get("/cycle-predictions/current", async (req, res) => {
    try {
      const userId = Number(req.query.userId);
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const prediction = await storage.getCurrentCyclePrediction(userId);
      
      if (!prediction) {
        return res.status(404).json({ message: "No current prediction found" });
      }
      
      res.status(200).json(prediction);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current cycle prediction" });
    }
  });

  // Resources routes
  apiRouter.get("/resources", async (req, res) => {
    try {
      const category = req.query.category as string;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      
      let resources;
      
      if (category) {
        resources = await storage.getResourcesByCategory(category);
      } else if (tags) {
        resources = await storage.getResourcesByTags(tags);
      } else {
        resources = await storage.getResources();
      }
      
      res.status(200).json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resources" });
    }
  });

  apiRouter.get("/resources/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const resource = await storage.getResource(id);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.status(200).json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resource" });
    }
  });

  // Community post routes
  apiRouter.get("/community-posts", async (req, res) => {
    try {
      const userId = req.query.userId ? Number(req.query.userId) : undefined;
      
      let posts;
      
      if (userId) {
        posts = await storage.getCommunityPostsByUserId(userId);
      } else {
        posts = await storage.getCommunityPosts();
      }
      
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get community posts" });
    }
  });

  apiRouter.get("/community-posts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const post = await storage.getCommunityPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to get community post" });
    }
  });

  apiRouter.post("/community-posts", async (req, res) => {
    try {
      const postData = insertCommunityPostSchema.parse(req.body);
      const post = await storage.createCommunityPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  apiRouter.post("/community-posts/:id/increment-responses", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.incrementResponseCount(id);
      const post = await storage.getCommunityPost(id);
      
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to increment response count" });
    }
  });

  // Mount the API router
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
