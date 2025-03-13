import axios from 'axios';
import * as cheerio from 'cheerio';
import type { ScraperConfig, ScraperJob, InsertScrapedProduct } from '@shared/schema';
import type { IStorage } from './storage';

// User agent list for spoofing
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
];

export async function runScraper(config: ScraperConfig, job: ScraperJob, storage: IStorage): Promise<ScraperJob> {
  try {
    console.log(`Starting scraper for ${config.name} (ID: ${config.id})`);
    
    // Update the config's lastRun time
    await storage.updateScraperConfig(config.id, { lastRun: new Date() });
    
    // Get data fields for this config
    const dataFields = await storage.getDataFields(config.id);
    
    if (dataFields.length === 0) {
      throw new Error('No data fields configured for this scraper');
    }
    
    console.log(`Found ${dataFields.length} data fields for scraping`);
    
    // Set up axios config
    const axiosConfig: any = {
      headers: {}
    };
    
    // User agent spoofing
    if (config.useUserAgentSpoofing) {
      const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      axiosConfig.headers['User-Agent'] = randomUA;
    }
    
    // Set up proxy if provided
    if (config.proxyUrl) {
      axiosConfig.proxy = {
        host: new URL(config.proxyUrl).hostname,
        port: parseInt(new URL(config.proxyUrl).port),
      };
      
      // Extract auth if present
      const userInfo = new URL(config.proxyUrl).username;
      if (userInfo) {
        const [username, password] = userInfo.split(':');
        if (username && password) {
          axiosConfig.proxy.auth = { username, password };
        }
      }
    }
    
    // Begin scraping
    let itemsScraped = 0;
    let currentPage = 1;
    
    while (currentPage <= config.pageLimit) {
      try {
        // Construct URL with pagination if needed
        let pageUrl = config.url;
        if (currentPage > 1) {
          // Simple pagination handling - in real app would be more sophisticated based on paginationType
          if (pageUrl.includes('?')) {
            pageUrl += `&page=${currentPage}`;
          } else {
            pageUrl += `?page=${currentPage}`;
          }
        }
        
        console.log(`Scraping page ${currentPage}: ${pageUrl}`);
        
        // Request the page
        const response = await axios.get(pageUrl, axiosConfig);
        const $ = cheerio.load(response.data);
        
        // In a real scraper, we'd have logic to handle different page types
        // For demo purposes, simulate finding products
        const productElements = $('.product-item'); // Example selector
        
        if (productElements.length === 0) {
          console.log('No products found on this page. Stopping pagination.');
          break;
        }
        
        // Simulate processing products
        // In a real app, we'd extract data using the field selectors
        for (let i = 0; i < 5; i++) {
          const product: InsertScrapedProduct = {
            configId: config.id,
            title: `Simulated Product ${Math.floor(Math.random() * 1000)}`,
            price: `$${(Math.random() * 100).toFixed(2)}`,
            description: "This is a simulated product from our web scraper",
            rating: (Math.random() * 5).toFixed(1),
            reviewCount: Math.floor(Math.random() * 500).toString(),
            imageUrl: null,
            productUrl: `${pageUrl}/product-${Math.floor(Math.random() * 1000)}`,
            category: ["Electronics", "Home & Kitchen", "Clothing", "Books"][Math.floor(Math.random() * 4)],
            inStock: Math.random() > 0.2,
            additionalData: { source: "simulated" }
          };
          
          await storage.createScrapedProduct(product);
          itemsScraped++;
        }
        
        // Update job progress
        await storage.updateScraperJob(job.id, {
          itemsScraped,
          status: "running"
        });
        
        // Respect request interval to avoid rate limiting
        if (currentPage < config.pageLimit) {
          await new Promise(resolve => setTimeout(resolve, config.requestInterval * 1000));
        }
        
        currentPage++;
      } catch (error) {
        console.error(`Error scraping page ${currentPage}:`, error);
        throw error;
      }
    }
    
    // Update job as completed
    const endTime = new Date();
    const updatedJob = await storage.updateScraperJob(job.id, {
      status: "completed",
      endTime,
      itemsScraped
    });
    
    console.log(`Scraping completed: ${itemsScraped} items scraped`);
    return updatedJob;
  } catch (error) {
    console.error('Scraper error:', error);
    
    // Update job as failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const endTime = new Date();
    const updatedJob = await storage.updateScraperJob(job.id, {
      status: "failed",
      endTime,
      error: errorMessage
    });
    
    return updatedJob;
  }
}
