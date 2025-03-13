import { 
  type InsertScrapedProduct, 
  type ScraperConfig, 
  type DataField 
} from "@shared/schema";
import { storage } from "../storage";

// Common user-agents for spoofing
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
];

// Function to get a random user agent
function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export interface ScraperResult {
  success: boolean;
  itemsScraped: number;
  error?: string;
  durationSeconds: number;
}

export class WebScraper {
  private config: ScraperConfig;
  private fields: DataField[];
  private jobId: number;
  
  constructor(config: ScraperConfig, fields: DataField[], jobId: number) {
    this.config = config;
    this.fields = fields;
    this.jobId = jobId;
  }
  
  async scrape(): Promise<ScraperResult> {
    try {
      // Record start time
      const startTime = Date.now();
      
      // Validate configuration
      if (!this.config.url) {
        throw new Error("No target URL specified in configuration");
      }
      
      if (this.fields.length === 0) {
        throw new Error("No data fields defined for extraction");
      }
      
      // Simulate scraping process
      // In a real implementation, this would make HTTP requests and use cheerio/puppeteer 
      // to parse the page and extract data based on the selectors
      
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
        }
      };
      
      // Apply user agent spoofing if enabled
      if (this.config.useUserAgentSpoofing) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'User-Agent': getRandomUserAgent()
        };
      }
      
      // Apply proxy if configured
      if (this.config.proxyUrl) {
        // In a real implementation, this would configure a proxy
        console.log(`Using proxy: ${this.config.proxyUrl}`);
      }
      
      // Process the pages
      const pageLimit = this.config.pageLimit || 1;
      let itemsScraped = 0;
      
      // For simulation, we're just going to create sample data 
      // rather than actually scraping (which would require external sites)
      const sampleData = [
        {
          title: "Wireless Bluetooth Headphones",
          price: "$59.99",
          description: "Noise cancelling, 20hr battery life",
          rating: "4.7",
          reviewCount: "432",
          category: "Electronics",
          inStock: true
        },
        {
          title: "Portable Blender 350ml",
          price: "$27.99",
          description: "USB Rechargeable, 6 Blades",
          rating: "4.2",
          reviewCount: "178", 
          category: "Home & Kitchen",
          inStock: true
        },
        {
          title: "Smart WiFi LED Light Bulb",
          price: "$14.99",
          description: "Works with Alexa & Google Home, Dimmable",
          rating: "4.5",
          reviewCount: "321",
          category: "Electronics",
          inStock: true
        }
      ];
      
      // Clear existing products for this config to simulate a fresh scrape
      await storage.deleteScrapedProducts(this.config.id);
      
      // Update job status to in_progress
      await storage.updateScraperJob(this.jobId, { status: "in_progress" });
      
      // For each page we would fetch in a real scraper
      for (let page = 1; page <= pageLimit; page++) {
        const pageUrl = `${this.config.url}${page > 1 ? `?page=${page}` : ''}`;
        
        // In a real scraper, we'd fetch and parse the HTML here
        console.log(`Processing page ${page}: ${pageUrl}`);
        
        // Simulate delay between requests to avoid rate limiting
        if (page > 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.requestInterval * 1000));
        }
        
        // For simulation, create some products with slight variations
        for (let i = 0; i < sampleData.length; i++) {
          const baseProduct = sampleData[i % sampleData.length];
          const productNumber = (page - 1) * sampleData.length + i + 1;
          
          const product: InsertScrapedProduct = {
            title: `${baseProduct.title} - Model ${productNumber}`,
            price: baseProduct.price,
            description: baseProduct.description,
            rating: baseProduct.rating,
            reviewCount: baseProduct.reviewCount,
            imageUrl: null,
            productUrl: `${pageUrl}/product-${productNumber}`,
            category: baseProduct.category,
            inStock: baseProduct.inStock,
            additionalData: { page },
            configId: this.config.id
          };
          
          await storage.createScrapedProduct(product);
          itemsScraped++;
        }
      }
      
      // Calculate duration
      const endTime = Date.now();
      const durationSeconds = Math.round((endTime - startTime) / 1000);
      
      // Update the job with completion information
      await storage.updateScraperJob(this.jobId, {
        status: "completed",
        itemsScraped,
      });
      
      // Update the config's lastRun timestamp
      await storage.updateScraperConfig(this.config.id, {});
      
      return {
        success: true,
        itemsScraped,
        durationSeconds
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Update the job with error information
      await storage.updateScraperJob(this.jobId, {
        status: "failed",
        error: errorMessage
      });
      
      return {
        success: false,
        itemsScraped: 0,
        error: errorMessage,
        durationSeconds: 0
      };
    }
  }
}
