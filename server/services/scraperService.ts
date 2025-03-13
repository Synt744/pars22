/**
 * Main Scraper Service
 * Integrates all protection bypass services and handles web scraping
 */

import { 
  type InsertScrapedProduct, 
  type ScraperConfig, 
  type DataField 
} from "@shared/schema";
import { storage } from "../storage";
import { getRandomUserAgent, generateBrowserHeaders } from "./userAgentService";
import { 
  isCloudflareProtected, 
  prepareCloudflareRequest 
} from "./cloudflareService";
import { 
  detectCaptcha, 
  solveCaptchaChallenge, 
  applyCaptchaSolution,
  CaptchaType
} from "./captchaService";
import { 
  parseProxyUrl, 
  createProxyConfig
} from "./proxyService";
import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';

export interface ScraperResult {
  success: boolean;
  itemsScraped: number;
  error?: string;
  durationSeconds: number;
  warnings?: string[];
}

export class EnhancedWebScraper {
  private config: ScraperConfig;
  private fields: DataField[];
  private jobId: number;
  private warnings: string[] = [];
  private captchaApiKey?: string;
  
  constructor(
    config: ScraperConfig, 
    fields: DataField[], 
    jobId: number,
    captchaApiKey?: string
  ) {
    this.config = config;
    this.fields = fields;
    this.jobId = jobId;
    this.captchaApiKey = captchaApiKey;
  }
  
  /**
   * Main scraping method
   */
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
      
      // Update job status to running
      await storage.updateScraperJob(this.jobId, { status: "running" });
      
      // Process the pages
      const pageLimit = this.config.pageLimit || 1;
      let itemsScraped = 0;
      
      // For each page we scrape
      for (let page = 1; page <= pageLimit; page++) {
        const pageUrl = this.buildPageUrl(page);
        
        console.log(`Processing page ${page}: ${pageUrl}`);
        
        // Respect request interval to avoid rate limiting
        if (page > 1) {
          await this.delay();
        }
        
        try {
          // Fetch the page content
          let response;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              // Initialize request options
              const requestOptions = this.initializeRequestOptions();
              response = await axios.get(pageUrl, requestOptions);
              break;
            } catch (error) {
              retryCount++;
              console.error(`Error fetching page (attempt ${retryCount}/${maxRetries}):`, error);
              
              if (retryCount >= maxRetries) {
                throw error;
              }
              
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          
          const html = response.data;
          const statusCode = response.status;
          
          // Check for Cloudflare protection
          if (this.config.useCloudflareBypass && isCloudflareProtected(html, statusCode)) {
            this.warnings.push(`Cloudflare protection detected on page ${page}. Cloudflare bypass requires additional setup.`);
            // In a full implementation, this would use puppeteer or a specialized service to solve the challenge
          }
          
          // Check for CAPTCHA
          const captchaInfo = detectCaptcha(html);
          if (this.config.useCaptchaHandling && captchaInfo.detected && captchaInfo.type && captchaInfo.siteKey) {
            this.warnings.push(`CAPTCHA detected on page ${page}. CAPTCHA handling requires an external service API key.`);
            // In a full implementation, this would solve the CAPTCHA using an external service
          }
          
          // Parse the HTML and extract data
          const $ = cheerio.load(html);
          
          // Process product elements based on field selectors
          const productElements = $(this.getContainerSelector());
          
          console.log(`Found ${productElements.length} product elements on page ${page}`);
          
          if (productElements.length === 0) {
            this.warnings.push(`No product elements found on page ${page}. Please verify selectors.`);
            
            // If this is the first page and no products found, it might indicate an issue with selectors
            if (page === 1) {
              throw new Error(`No product elements found. Please verify that the selector '${this.getContainerSelector()}' is correct.`);
            }
            
            // For subsequent pages, we'll just break the loop
            break;
          }
          
          // Process each product element
          productElements.each(async (i, element) => {
            try {
              const product = this.extractProductData($, element);
              await storage.createScrapedProduct(product);
              itemsScraped++;
              
              // Update job progress periodically (every 5 items)
              if (itemsScraped % 5 === 0) {
                await storage.updateScraperJob(this.jobId, {
                  itemsScraped,
                  status: "running"
                });
              }
            } catch (error) {
              console.error(`Error processing product ${i+1} on page ${page}:`, error);
              this.warnings.push(`Failed to process product ${i+1} on page ${page}: ${error instanceof Error ? error.message : String(error)}`);
            }
          });
          
        } catch (error) {
          console.error(`Error processing page ${page}:`, error);
          this.warnings.push(`Error processing page ${page}: ${error instanceof Error ? error.message : String(error)}`);
          
          // If this is the first page and it failed, we'll abort
          if (page === 1) {
            throw error;
          }
          
          // For subsequent pages, we'll continue to the next one
          continue;
        }
      }
      
      // Calculate duration
      const endTime = Date.now();
      const durationSeconds = Math.round((endTime - startTime) / 1000);
      
      return {
        success: true,
        itemsScraped,
        durationSeconds,
        warnings: this.warnings.length > 0 ? this.warnings : undefined
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        itemsScraped: 0,
        error: errorMessage,
        durationSeconds: 0,
        warnings: this.warnings.length > 0 ? this.warnings : undefined
      };
    }
  }
  
  /**
   * Initialize the request options based on configuration
   */
  private initializeRequestOptions(): AxiosRequestConfig {
    // Base request options
    let options: AxiosRequestConfig = {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
      },
      timeout: 30000,
      maxRedirects: 5
    };
    
    // Apply user agent spoofing
    if (this.config.useUserAgentSpoofing) {
      const userAgent = getRandomUserAgent();
      options.headers = {
        ...options.headers,
        ...generateBrowserHeaders(userAgent)
      };
    }
    
    // Apply proxy if configured
    if (this.config.proxyUrl) {
      const proxyConfig = parseProxyUrl(this.config.proxyUrl);
      
      if (proxyConfig) {
        options.proxy = createProxyConfig(proxyConfig);
      } else {
        this.warnings.push(`Invalid proxy configuration: ${this.config.proxyUrl}`);
      }
    }
    
    return options;
  }
  
  /**
   * Build the URL for a specific page
   */
  private buildPageUrl(page: number): string {
    const baseUrl = this.config.url;
    
    // Simple pagination strategy
    if (page === 1) {
      return baseUrl;
    }
    
    // Check if the URL already has query parameters
    const hasParams = baseUrl.includes('?');
    const separator = hasParams ? '&' : '?';
    
    return `${baseUrl}${separator}page=${page}`;
  }
  
  /**
   * Wait for the configured interval between requests
   */
  private async delay(): Promise<void> {
    const intervalSeconds = this.config.requestInterval || 2;
    await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
  }
  
  /**
   * Get the container selector for products
   */
  private getContainerSelector(): string {
    return this.config.containerSelector || '.product-item, .product, [data-product-id]';
  }
  
  /**
   * Extract product data from an element using field selectors
   */
  private extractProductData($: cheerio.CheerioAPI, element: cheerio.Element): InsertScrapedProduct {
    const productData: InsertScrapedProduct = {
      configId: this.config.id,
      title: "",
      price: null,
      description: null,
      rating: null,
      reviewCount: null,
      imageUrl: null,
      productUrl: null,
      category: null,
      inStock: true,
      additionalData: {}
    };
    
    // Process each field using its selector
    for (const field of this.fields) {
      try {
        if (!field.selector) continue;
        
        const value = this.extractFieldValue($, element, field);
        
        // Map the field to the appropriate product data property
        switch (field.name.toLowerCase()) {
          case 'title':
            productData.title = value;
            break;
          case 'price':
            productData.price = value;
            break;
          case 'description':
            productData.description = value;
            break;
          case 'rating':
            productData.rating = value;
            break;
          case 'reviewcount':
          case 'review_count':
          case 'reviews':
            productData.reviewCount = value;
            break;
          case 'image':
          case 'imageurl':
          case 'image_url':
            productData.imageUrl = value;
            break;
          case 'url':
          case 'producturl':
          case 'product_url':
            productData.productUrl = this.normalizeUrl(value);
            break;
          case 'category':
            productData.category = value;
            break;
          case 'instock':
          case 'in_stock':
          case 'availability':
            productData.inStock = value.toLowerCase().includes('in stock') || 
                                  !value.toLowerCase().includes('out of stock');
            break;
          default:
            // Store additional fields in additionalData
            if (productData.additionalData) {
              productData.additionalData[field.name] = value;
            }
        }
      } catch (error) {
        console.error(`Error extracting field ${field.name}:`, error);
      }
    }
    
    // Ensure title is not empty (required field)
    if (!productData.title) {
      productData.title = `Product ${Date.now()}`;
    }
    
    return productData;
  }
  
  /**
   * Extract a field value from an element using its selector
   */
  private extractFieldValue($: cheerio.CheerioAPI, element: cheerio.Element, field: DataField): string {
    let value = '';
    
    try {
      if (!field.selector) return '';
      
      const $element = $(element);
      let $fieldElement;
      
      // Apply selector relative to the container element
      if (field.selector.startsWith('/')) {
        // XPath selector (simplified - in a real implementation would use a proper XPath library)
        this.warnings.push(`XPath selectors are not fully supported: ${field.selector}`);
        $fieldElement = $element.find(field.selector.substring(1));
      } else {
        // CSS selector
        $fieldElement = $element.find(field.selector);
      }
      
      // Extract based on attribute type
      if (field.attribute) {
        if (field.attribute === 'text') {
          value = $fieldElement.text().trim();
        } else if (field.attribute === 'html') {
          value = $fieldElement.html() || '';
        } else {
          value = $fieldElement.attr(field.attribute) || '';
        }
      } else {
        // Default to text content
        value = $fieldElement.text().trim();
      }
      
      // Apply regex if specified
      if (field.regex) {
        try {
          const regex = new RegExp(field.regex);
          const match = value.match(regex);
          if (match && match[1]) {
            value = match[1];
          }
        } catch (error) {
          console.error(`Invalid regex pattern: ${field.regex}`, error);
        }
      }
      
      return value;
    } catch (error) {
      console.error(`Error extracting field ${field.name}:`, error);
      return '';
    }
  }
  
  /**
   * Normalize a URL (make relative URLs absolute)
   */
  private normalizeUrl(url: string): string {
    if (!url) return '';
    
    try {
      if (url.startsWith('http')) {
        return url;
      } else if (url.startsWith('//')) {
        return `https:${url}`;
      } else if (url.startsWith('/')) {
        const baseUrl = new URL(this.config.url);
        return `${baseUrl.protocol}//${baseUrl.host}${url}`;
      } else {
        return new URL(url, this.config.url).href;
      }
    } catch (error) {
      console.error('Error normalizing URL:', error);
      return url;
    }
  }
}