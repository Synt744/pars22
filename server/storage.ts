import { 
  users, type User, type InsertUser,
  scraperConfigs, type ScraperConfig, type InsertScraperConfig, type UpdateScraperConfig,
  dataFields, type DataField, type InsertDataField,
  scrapedProducts, type ScrapedProduct, type InsertScrapedProduct,
  scraperJobs, type ScraperJob, type InsertScraperJob, type UpdateScraperJob
} from "@shared/schema";

// Storage interface for database operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Scraper config methods
  getScraperConfig(id: number): Promise<ScraperConfig | undefined>;
  getScraperConfigs(): Promise<ScraperConfig[]>;
  createScraperConfig(config: InsertScraperConfig): Promise<ScraperConfig>;
  updateScraperConfig(id: number, config: Partial<UpdateScraperConfig>): Promise<ScraperConfig | undefined>;
  deleteScraperConfig(id: number): Promise<boolean>;
  
  // Data field methods
  getDataFields(configId: number): Promise<DataField[]>;
  createDataField(field: InsertDataField): Promise<DataField>;
  updateDataField(id: number, field: Partial<InsertDataField>): Promise<DataField | undefined>;
  deleteDataField(id: number): Promise<boolean>;
  
  // Scraped product methods
  getScrapedProduct(id: number): Promise<ScrapedProduct | undefined>;
  getScrapedProducts(configId: number, limit?: number, offset?: number): Promise<ScrapedProduct[]>;
  getProductCount(configId: number): Promise<number>;
  createScrapedProduct(product: InsertScrapedProduct): Promise<ScrapedProduct>;
  deleteScrapedProducts(configId: number): Promise<boolean>;
  searchScrapedProducts(configId: number, searchTerm: string): Promise<ScrapedProduct[]>;
  
  // Scraper job methods
  getScraperJobs(configId: number): Promise<ScraperJob[]>;
  getRecentJobs(limit: number): Promise<ScraperJob[]>;
  createScraperJob(job: InsertScraperJob): Promise<ScraperJob>;
  updateScraperJob(id: number, job: Partial<UpdateScraperJob>): Promise<ScraperJob | undefined>;
}

// In-memory implementation for development
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scraperConfigs: Map<number, ScraperConfig>;
  private dataFields: Map<number, DataField>;
  private scrapedProducts: Map<number, ScrapedProduct>;
  private scraperJobs: Map<number, ScraperJob>;
  
  private currentUserId: number;
  private currentConfigId: number;
  private currentFieldId: number;
  private currentProductId: number;
  private currentJobId: number;

  constructor() {
    this.users = new Map();
    this.scraperConfigs = new Map();
    this.dataFields = new Map();
    this.scrapedProducts = new Map();
    this.scraperJobs = new Map();
    
    this.currentUserId = 1;
    this.currentConfigId = 1;
    this.currentFieldId = 1;
    this.currentProductId = 1;
    this.currentJobId = 1;
    
    // Add some initial data for development
    this.initDemoData();
  }

  private initDemoData() {
    // Add a default user
    const user: User = {
      id: this.currentUserId++,
      username: "demo",
      password: "demo123"
    };
    this.users.set(user.id, user);
    
    // Add a sample scraper config
    const config: ScraperConfig = {
      id: this.currentConfigId++,
      name: "Amazon Electronics",
      url: "https://marketplace.example.com/products",
      pageType: "product_listing",
      paginationType: "standard",
      pageLimit: 5,
      requestInterval: 3,
      useUserAgentSpoofing: true,
      useCloudflareBypass: false,
      useCaptchaHandling: false,
      proxyUrl: null,
      dateCreated: new Date(),
      lastRun: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
      userId: user.id
    };
    this.scraperConfigs.set(config.id, config);
    
    // Add some sample data fields
    const fields = [
      { name: "Product Name", selector: ".product-title h1", status: "active" },
      { name: "Product Price", selector: ".product-price .current-price", status: "active" },
      { name: "Product Rating", selector: ".product-rating .rating-value", status: "active" },
      { name: "Product Description", selector: ".product-description", status: "active" }
    ];
    
    fields.forEach(field => {
      const dataField: DataField = {
        id: this.currentFieldId++,
        configId: config.id,
        name: field.name,
        selector: field.selector,
        status: field.status,
        dateCreated: new Date()
      };
      this.dataFields.set(dataField.id, dataField);
    });
    
    // Add some sample products
    const products = [
      {
        title: "Wireless Bluetooth Headphones",
        price: "$59.99",
        description: "Noise cancelling, 20hr battery life",
        rating: "4.7",
        reviewCount: "432",
        imageUrl: null,
        productUrl: "https://marketplace.example.com/products/headphones",
        category: "Electronics",
        inStock: true
      },
      {
        title: "Portable Blender 350ml",
        price: "$27.99",
        description: "USB Rechargeable, 6 Blades",
        rating: "4.2",
        reviewCount: "178",
        imageUrl: null,
        productUrl: "https://marketplace.example.com/products/blender",
        category: "Home & Kitchen",
        inStock: true
      },
      {
        title: "Smart WiFi LED Light Bulb",
        price: "$14.99",
        description: "Works with Alexa & Google Home, Dimmable",
        rating: "4.5",
        reviewCount: "321",
        imageUrl: null,
        productUrl: "https://marketplace.example.com/products/lightbulb",
        category: "Electronics",
        inStock: false
      },
      {
        title: "Robot Vacuum Cleaner",
        price: "$199.99",
        description: "Smart Navigation, Auto Recharge",
        rating: "4.8",
        reviewCount: "187",
        imageUrl: null,
        productUrl: "https://marketplace.example.com/products/vacuum",
        category: "Home & Kitchen",
        inStock: true
      },
      {
        title: "Digital Drawing Tablet",
        price: "$79.99",
        description: "10\" Screen, Pressure-Sensitive Pen",
        rating: "4.3",
        reviewCount: "96",
        imageUrl: null,
        productUrl: "https://marketplace.example.com/products/tablet",
        category: "Art & Crafts",
        inStock: true
      }
    ];
    
    products.forEach(p => {
      const product: ScrapedProduct = {
        id: this.currentProductId++,
        title: p.title,
        price: p.price,
        description: p.description,
        rating: p.rating,
        reviewCount: p.reviewCount,
        imageUrl: p.imageUrl,
        productUrl: p.productUrl,
        category: p.category,
        inStock: p.inStock,
        additionalData: {},
        configId: config.id,
        dateScraped: new Date()
      };
      this.scrapedProducts.set(product.id, product);
    });
    
    // Add a sample scraper job
    const job: ScraperJob = {
      id: this.currentJobId++,
      configId: config.id,
      status: "completed",
      startTime: new Date(Date.now() - 3 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 60 * 1000),
      itemsScraped: 5,
      error: null,
      durationSeconds: 43
    };
    this.scraperJobs.set(job.id, job);
    
    // Add some more configs
    const configs = [
      { name: "Etsy Handmade Items", lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { name: "eBay Collectibles", lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    ];
    
    configs.forEach(c => {
      const additionalConfig: ScraperConfig = {
        id: this.currentConfigId++,
        name: c.name,
        url: "https://marketplace.example.com/products",
        pageType: "product_listing",
        paginationType: "standard",
        pageLimit: 5,
        requestInterval: 3,
        useUserAgentSpoofing: true,
        useCloudflareBypass: false,
        useCaptchaHandling: false,
        proxyUrl: null,
        dateCreated: new Date(),
        lastRun: c.lastRun,
        userId: user.id
      };
      this.scraperConfigs.set(additionalConfig.id, additionalConfig);
      
      // Add a job for each config
      const additionalJob: ScraperJob = {
        id: this.currentJobId++,
        configId: additionalConfig.id,
        status: "completed",
        startTime: new Date(c.lastRun.getTime() - 60 * 1000),
        endTime: c.lastRun,
        itemsScraped: 10,
        error: null,
        durationSeconds: 30
      };
      this.scraperJobs.set(additionalJob.id, additionalJob);
    });
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Scraper config methods
  async getScraperConfig(id: number): Promise<ScraperConfig | undefined> {
    return this.scraperConfigs.get(id);
  }
  
  async getScraperConfigs(): Promise<ScraperConfig[]> {
    return Array.from(this.scraperConfigs.values());
  }
  
  async createScraperConfig(config: InsertScraperConfig): Promise<ScraperConfig> {
    const id = this.currentConfigId++;
    const newConfig: ScraperConfig = {
      ...config,
      id,
      pageType: config.pageType || 'product_listing',
      paginationType: config.paginationType || 'page_param',
      pageLimit: config.pageLimit || 5,
      requestInterval: config.requestInterval || 2,
      useUserAgentSpoofing: config.useUserAgentSpoofing || false,
      useCloudflareBypass: config.useCloudflareBypass || false,
      useCaptchaHandling: config.useCaptchaHandling || false,
      proxyUrl: config.proxyUrl || null,
      dateCreated: new Date(),
      lastRun: null,
      userId: config.userId || null
    };
    this.scraperConfigs.set(id, newConfig);
    return newConfig;
  }
  
  async updateScraperConfig(id: number, config: Partial<UpdateScraperConfig>): Promise<ScraperConfig | undefined> {
    const existingConfig = this.scraperConfigs.get(id);
    if (!existingConfig) return undefined;
    
    const updatedConfig = { ...existingConfig, ...config };
    this.scraperConfigs.set(id, updatedConfig);
    return updatedConfig;
  }
  
  async deleteScraperConfig(id: number): Promise<boolean> {
    return this.scraperConfigs.delete(id);
  }
  
  // Data field methods
  async getDataFields(configId: number): Promise<DataField[]> {
    return Array.from(this.dataFields.values()).filter(
      field => field.configId === configId
    );
  }
  
  async createDataField(field: InsertDataField): Promise<DataField> {
    const id = this.currentFieldId++;
    const newField: DataField = {
      ...field,
      id,
      status: field.status || 'active',
      dateCreated: new Date()
    };
    this.dataFields.set(id, newField);
    return newField;
  }
  
  async updateDataField(id: number, field: Partial<InsertDataField>): Promise<DataField | undefined> {
    const existingField = this.dataFields.get(id);
    if (!existingField) return undefined;
    
    const updatedField = { ...existingField, ...field };
    this.dataFields.set(id, updatedField);
    return updatedField;
  }
  
  async deleteDataField(id: number): Promise<boolean> {
    return this.dataFields.delete(id);
  }
  
  // Scraped product methods
  async getScrapedProduct(id: number): Promise<ScrapedProduct | undefined> {
    return this.scrapedProducts.get(id);
  }
  
  async getScrapedProducts(configId: number, limit = 20, offset = 0): Promise<ScrapedProduct[]> {
    const products = Array.from(this.scrapedProducts.values())
      .filter(product => product.configId === configId)
      .sort((a, b) => b.dateScraped.getTime() - a.dateScraped.getTime()); // newest first
      
    return products.slice(offset, offset + limit);
  }
  
  async getProductCount(configId: number): Promise<number> {
    return Array.from(this.scrapedProducts.values())
      .filter(product => product.configId === configId)
      .length;
  }
  
  async createScrapedProduct(product: InsertScrapedProduct): Promise<ScrapedProduct> {
    const id = this.currentProductId++;
    const newProduct: ScrapedProduct = {
      ...product,
      id,
      price: product.price || null,
      description: product.description || null,
      rating: product.rating || null,
      reviewCount: product.reviewCount || null,
      imageUrl: product.imageUrl || null,
      productUrl: product.productUrl || null,
      category: product.category || null,
      inStock: product.inStock || false,
      additionalData: product.additionalData || {},
      dateScraped: new Date()
    };
    this.scrapedProducts.set(id, newProduct);
    return newProduct;
  }
  
  async deleteScrapedProducts(configId: number): Promise<boolean> {
    const products = Array.from(this.scrapedProducts.values())
      .filter(product => product.configId === configId);
      
    products.forEach(product => this.scrapedProducts.delete(product.id));
    return true;
  }
  
  async searchScrapedProducts(configId: number, searchTerm: string): Promise<ScrapedProduct[]> {
    const term = searchTerm.toLowerCase();
    return Array.from(this.scrapedProducts.values())
      .filter(product => product.configId === configId)
      .filter(product => 
        product.title.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.category && product.category.toLowerCase().includes(term))
      )
      .sort((a, b) => b.dateScraped.getTime() - a.dateScraped.getTime());
  }
  
  // Scraper job methods
  async getScraperJobs(configId: number): Promise<ScraperJob[]> {
    return Array.from(this.scraperJobs.values())
      .filter(job => job.configId === configId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
  
  async getRecentJobs(limit: number): Promise<ScraperJob[]> {
    return Array.from(this.scraperJobs.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit)
      .map(job => {
        // Add config name for display purposes
        const config = this.scraperConfigs.get(job.configId);
        return {
          ...job,
          configName: config ? config.name : null
        };
      });
  }
  
  async createScraperJob(job: InsertScraperJob): Promise<ScraperJob> {
    const id = this.currentJobId++;
    const startTime = new Date();
    const newJob: ScraperJob = {
      ...job,
      id,
      status: job.status || 'pending',
      startTime,
      endTime: null,
      itemsScraped: job.itemsScraped || 0,
      error: job.error || null,
      durationSeconds: null
    };
    this.scraperJobs.set(id, newJob);
    return newJob;
  }
  
  async updateScraperJob(id: number, job: Partial<UpdateScraperJob>): Promise<ScraperJob | undefined> {
    const existingJob = this.scraperJobs.get(id);
    if (!existingJob) return undefined;
    
    const updatedJob = { ...existingJob, ...job };
    
    // Calculate duration if endTime is set
    if (job.endTime && existingJob.startTime) {
      updatedJob.durationSeconds = Math.round((job.endTime.getTime() - existingJob.startTime.getTime()) / 1000);
    }
    
    this.scraperJobs.set(id, updatedJob);
    return updatedJob;
  }
}

export const storage = new MemStorage();
