import { 
  User, InsertUser, 
  CycleEntry, InsertCycleEntry,
  CyclePrediction, InsertCyclePrediction,
  Resource, InsertResource,
  CommunityPost, InsertCommunityPost
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cycle entry methods
  getCycleEntries(userId: number): Promise<CycleEntry[]>;
  getCycleEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<CycleEntry[]>;
  getCycleEntryByDate(userId: number, date: Date): Promise<CycleEntry | undefined>;
  createCycleEntry(entry: InsertCycleEntry): Promise<CycleEntry>;
  updateCycleEntry(id: number, entry: Partial<InsertCycleEntry>): Promise<CycleEntry | undefined>;
  
  // Cycle prediction methods
  getCyclePredictions(userId: number): Promise<CyclePrediction[]>;
  getCurrentCyclePrediction(userId: number): Promise<CyclePrediction | undefined>;
  createCyclePrediction(prediction: InsertCyclePrediction): Promise<CyclePrediction>;
  
  // Resource methods
  getResources(): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  getResourcesByTags(tags: string[]): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  
  // Community post methods
  getCommunityPosts(): Promise<CommunityPost[]>;
  getCommunityPostsByUserId(userId: number): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  incrementResponseCount(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cycleEntries: Map<number, CycleEntry>;
  private cyclePredictions: Map<number, CyclePrediction>;
  private resources: Map<number, Resource>;
  private communityPosts: Map<number, CommunityPost>;
  private currentId: {
    users: number;
    cycleEntries: number;
    cyclePredictions: number;
    resources: number;
    communityPosts: number;
  };

  constructor() {
    this.users = new Map();
    this.cycleEntries = new Map();
    this.cyclePredictions = new Map();
    this.resources = new Map();
    this.communityPosts = new Map();
    
    this.currentId = {
      users: 1,
      cycleEntries: 1,
      cyclePredictions: 1,
      resources: 1,
      communityPosts: 1,
    };
    
    // Initialize with sample resources
    this.initializeResources();
    this.initializeCommunityPosts();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Cycle entry methods
  async getCycleEntries(userId: number): Promise<CycleEntry[]> {
    return Array.from(this.cycleEntries.values()).filter(
      (entry) => entry.userId === userId,
    );
  }

  async getCycleEntriesByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<CycleEntry[]> {
    return Array.from(this.cycleEntries.values()).filter(
      (entry) => 
        entry.userId === userId && 
        entry.date >= startDate && 
        entry.date <= endDate
    );
  }

  async getCycleEntryByDate(
    userId: number,
    date: Date
  ): Promise<CycleEntry | undefined> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.cycleEntries.values()).find(
      (entry) => 
        entry.userId === userId && 
        entry.date.toISOString().split('T')[0] === dateString
    );
  }

  async createCycleEntry(insertEntry: InsertCycleEntry): Promise<CycleEntry> {
    const id = this.currentId.cycleEntries++;
    const createdAt = new Date();
    
    // Check if an entry for this date already exists
    const existingEntry = await this.getCycleEntryByDate(
      insertEntry.userId,
      new Date(insertEntry.date)
    );
    
    // If it exists, update it instead of creating a new one
    if (existingEntry) {
      return this.updateCycleEntry(existingEntry.id, insertEntry) as Promise<CycleEntry>;
    }
    
    const entry: CycleEntry = { ...insertEntry, id, createdAt };
    this.cycleEntries.set(id, entry);
    
    // Update cycle prediction
    await this.updatePrediction(insertEntry.userId);
    
    return entry;
  }

  async updateCycleEntry(
    id: number,
    updateData: Partial<InsertCycleEntry>
  ): Promise<CycleEntry | undefined> {
    const entry = this.cycleEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...updateData };
    this.cycleEntries.set(id, updatedEntry);
    
    // Update cycle prediction
    await this.updatePrediction(entry.userId);
    
    return updatedEntry;
  }

  // Cycle prediction methods
  async getCyclePredictions(userId: number): Promise<CyclePrediction[]> {
    return Array.from(this.cyclePredictions.values()).filter(
      (prediction) => prediction.userId === userId,
    );
  }

  async getCurrentCyclePrediction(userId: number): Promise<CyclePrediction | undefined> {
    const predictions = await this.getCyclePredictions(userId);
    if (predictions.length === 0) return undefined;
    
    // Return the most recent prediction
    return predictions.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
  }

  async createCyclePrediction(insertPrediction: InsertCyclePrediction): Promise<CyclePrediction> {
    const id = this.currentId.cyclePredictions++;
    const createdAt = new Date();
    const prediction: CyclePrediction = { ...insertPrediction, id, createdAt };
    this.cyclePredictions.set(id, prediction);
    return prediction;
  }

  // Helper method to update prediction when new cycle data is added
  private async updatePrediction(userId: number): Promise<void> {
    // Get all cycle entries for this user
    const entries = await this.getCycleEntries(userId);
    
    // Need at least 1 entry to make a prediction
    if (entries.length === 0) return;
    
    // Filter to just period entries (with flow)
    const periodEntries = entries.filter(entry => 
      entry.periodFlow && entry.periodFlow !== 'none'
    );
    
    if (periodEntries.length === 0) return;
    
    // Sort by date
    periodEntries.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group period entries into cycles
    const cycles: CycleEntry[][] = [];
    let currentCycle: CycleEntry[] = [];
    
    for (let i = 0; i < periodEntries.length; i++) {
      if (currentCycle.length === 0) {
        currentCycle.push(periodEntries[i]);
      } else {
        const lastEntryDate = new Date(currentCycle[currentCycle.length - 1].date);
        const currentEntryDate = new Date(periodEntries[i].date);
        
        // If more than 3 days gap, consider it a new cycle
        const diffDays = Math.floor((currentEntryDate.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3) {
          currentCycle.push(periodEntries[i]);
        } else {
          cycles.push([...currentCycle]);
          currentCycle = [periodEntries[i]];
        }
      }
    }
    
    if (currentCycle.length > 0) {
      cycles.push(currentCycle);
    }
    
    if (cycles.length < 1) return;
    
    // Calculate average cycle length
    let totalCycleLength = 0;
    for (let i = 1; i < cycles.length; i++) {
      const prevCycleStartDate = new Date(cycles[i-1][0].date);
      const currCycleStartDate = new Date(cycles[i][0].date);
      const cycleLength = Math.floor((currCycleStartDate.getTime() - prevCycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
      totalCycleLength += cycleLength;
    }
    
    const avgCycleLength = cycles.length > 1 
      ? Math.round(totalCycleLength / (cycles.length - 1)) 
      : 28; // Default to 28 if not enough data
    
    // Calculate average period length
    let totalPeriodLength = 0;
    for (const cycle of cycles) {
      totalPeriodLength += cycle.length;
    }
    const avgPeriodLength = Math.round(totalPeriodLength / cycles.length);
    
    // Get last period start date
    const lastCycle = cycles[cycles.length - 1];
    const lastPeriodStartDate = new Date(lastCycle[0].date);
    
    // Calculate next period start date
    const nextPeriodStartDate = new Date(lastPeriodStartDate);
    nextPeriodStartDate.setDate(nextPeriodStartDate.getDate() + avgCycleLength);
    
    // Calculate next period end date
    const nextPeriodEndDate = new Date(nextPeriodStartDate);
    nextPeriodEndDate.setDate(nextPeriodEndDate.getDate() + avgPeriodLength - 1);
    
    // Calculate ovulation date (14 days before next period)
    const ovulationDate = new Date(nextPeriodStartDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);
    
    // Calculate fertile window (5 days before ovulation to 1 day after)
    const fertileStartDate = new Date(ovulationDate);
    fertileStartDate.setDate(fertileStartDate.getDate() - 5);
    
    const fertileEndDate = new Date(ovulationDate);
    fertileEndDate.setDate(fertileEndDate.getDate() + 1);
    
    // Create the prediction
    await this.createCyclePrediction({
      userId,
      periodStartDate: nextPeriodStartDate,
      periodEndDate: nextPeriodEndDate,
      ovulationDate,
      fertileStartDate,
      fertileEndDate
    });
  }

  // Resource methods
  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      (resource) => resource.category === category,
    );
  }

  async getResourcesByTags(tags: string[]): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      (resource) => tags.some(tag => resource.tags?.includes(tag)),
    );
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  // Community post methods
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values());
  }

  async getCommunityPostsByUserId(userId: number): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values()).filter(
      (post) => post.userId === userId,
    );
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.currentId.communityPosts++;
    const now = new Date();
    const post: CommunityPost = { 
      ...insertPost, 
      id, 
      responseCount: 0, 
      createdAt: now, 
      updatedAt: now 
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async incrementResponseCount(id: number): Promise<void> {
    const post = this.communityPosts.get(id);
    if (post) {
      post.responseCount = (post.responseCount || 0) + 1;
      post.updatedAt = new Date();
      this.communityPosts.set(id, post);
    }
  }

  // Initialize with sample resources
  private initializeResources(): void {
    const sampleResources: InsertResource[] = [
      {
        title: "Understanding Ovulation: Signs & Symptoms",
        description: "Learn to recognize the signs of ovulation for better cycle awareness",
        content: "Ovulation is the process in which a mature egg is released from the ovary...",
        category: "article",
        tags: ["ovulation", "fertility", "reproductive-health"],
        imageUrl: ""
      },
      {
        title: "Hormonal Changes & Your Mood",
        description: "How hormonal fluctuations affect your emotional wellbeing",
        content: "Throughout your menstrual cycle, hormone levels rise and fall...",
        category: "video",
        tags: ["hormones", "mood", "mental-health"],
        imageUrl: ""
      },
      {
        title: "Q&A: Cycle Irregularities & When to See a Doctor",
        description: "Expert advice on understanding irregular periods",
        content: "Many factors can cause irregular cycles, from stress to medical conditions...",
        category: "qa",
        tags: ["irregular-periods", "medical-advice", "pcos"],
        imageUrl: ""
      },
      {
        title: "Managing Period Pain Naturally",
        description: "Effective remedies for menstrual cramps without medication",
        content: "While painkillers can provide relief, there are many natural approaches...",
        category: "article",
        tags: ["period-pain", "natural-remedies", "self-care"],
        imageUrl: ""
      },
      {
        title: "Nutrition Throughout Your Cycle",
        description: "How to adjust your diet based on your menstrual phases",
        content: "Your nutritional needs change throughout your cycle...",
        category: "article",
        tags: ["nutrition", "diet", "hormones"],
        imageUrl: ""
      }
    ];

    sampleResources.forEach(resource => {
      const id = this.currentId.resources++;
      const now = new Date();
      this.resources.set(id, { ...resource, id, createdAt: now });
    });
  }

  // Initialize with sample community posts
  private initializeCommunityPosts(): void {
    // Create a sample user if none exists
    if (this.users.size === 0) {
      this.users.set(1, {
        id: 1,
        username: "luna_admin",
        password: "admin_password",
        email: "admin@lunacycle.com",
        name: "Luna Admin",
        createdAt: new Date()
      });
      this.currentId.users = 2;
    }

    const samplePosts: InsertCommunityPost[] = [
      {
        userId: 1,
        title: "Do you experience mood changes before ovulation?",
        content: "I've noticed I get really energetic and upbeat a few days before ovulation. Is this common?",
        tags: ["mood", "ovulation", "hormones"]
      },
      {
        userId: 1,
        title: "How to manage period cramps naturally?",
        content: "I'm looking for alternatives to painkillers for managing menstrual pain. What works for you?",
        tags: ["cramps", "natural-remedies", "pain-management"]
      },
      {
        userId: 1,
        title: "Signs of hormonal imbalance?",
        content: "What symptoms should I look out for that might indicate a hormonal imbalance?",
        tags: ["hormones", "health", "symptoms"]
      }
    ];

    samplePosts.forEach(post => {
      const id = this.currentId.communityPosts++;
      const now = new Date();
      this.communityPosts.set(id, { 
        ...post, 
        id, 
        responseCount: Math.floor(Math.random() * 100), 
        createdAt: now, 
        updatedAt: now 
      });
    });
  }
}

export const storage = new MemStorage();
