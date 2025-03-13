import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { EnhancedWebScraper } from "./services/scraperService";
import { z } from "zod";
import { 
  insertScraperConfigSchema, 
  updateScraperConfigSchema,
  insertDataFieldSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix for all routes
  const apiPrefix = "/api";
  
  // Helper function for error handling
  const handleError = (res: Response, error: unknown) => {
    console.error("API Error:", error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: fromZodError(error).message
      });
    }
    
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as any).statusCode : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    
    return res.status(statusCode).json({ message });
  };
  
  // ==== Scraper Configuration Routes ====
  
  // Get all scraper configurations
  app.get(`${apiPrefix}/configs`, async (req: Request, res: Response) => {
    try {
      const configs = await storage.getScraperConfigs();
      res.json(configs);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get a specific scraper configuration
  app.get(`${apiPrefix}/configs/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const config = await storage.getScraperConfig(id);
      
      if (!config) {
        return res.status(404).json({ message: "Scraper configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Create a new scraper configuration
  app.post(`${apiPrefix}/configs`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertScraperConfigSchema.parse(req.body);
      const config = await storage.createScraperConfig(validatedData);
      res.status(201).json(config);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Update a scraper configuration
  app.patch(`${apiPrefix}/configs/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = updateScraperConfigSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedConfig = await storage.updateScraperConfig(id, validatedData);
      
      if (!updatedConfig) {
        return res.status(404).json({ message: "Scraper configuration not found" });
      }
      
      res.json(updatedConfig);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Delete a scraper configuration
  app.delete(`${apiPrefix}/configs/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteScraperConfig(id);
      
      if (!success) {
        return res.status(404).json({ message: "Scraper configuration not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // ==== Data Field Routes ====
  
  // Get all data fields for a config
  app.get(`${apiPrefix}/configs/:configId/fields`, async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      const fields = await storage.getDataFields(configId);
      res.json(fields);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Create a new data field
  app.post(`${apiPrefix}/fields`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertDataFieldSchema.parse(req.body);
      const field = await storage.createDataField(validatedData);
      res.status(201).json(field);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Update a data field
  app.patch(`${apiPrefix}/fields/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updateSchema = insertDataFieldSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      
      const updatedField = await storage.updateDataField(id, validatedData);
      
      if (!updatedField) {
        return res.status(404).json({ message: "Data field not found" });
      }
      
      res.json(updatedField);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Delete a data field
  app.delete(`${apiPrefix}/fields/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDataField(id);
      
      if (!success) {
        return res.status(404).json({ message: "Data field not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // ==== Scraping Routes ====
  
  // Start a scraping job
  app.post(`${apiPrefix}/configs/:id/scrape`, async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.id);
      const config = await storage.getScraperConfig(configId);
      
      if (!config) {
        return res.status(404).json({ message: "Scraper configuration not found" });
      }
      
      const dataFields = await storage.getDataFields(configId);
      
      if (dataFields.length === 0) {
        return res.status(400).json({ message: "No data fields defined for extraction" });
      }
      
      // Create a new job
      const job = await storage.createScraperJob({
        configId,
        status: "pending",
        itemsScraped: 0,
        error: null
      });
      
      // Start the scraping process with enhanced protection capabilities
      // Получаем CAPTCHA API Key из запроса или конфигурации
      const captchaApiKey = req.query.captchaApiKey as string;
      const scraper = new EnhancedWebScraper(config, dataFields, job.id, captchaApiKey);
      
      // We don't await here as we want to return immediately and let the scraping run in the background
      scraper.scrape().then(async (result: { 
        success: boolean; 
        itemsScraped: number; 
        error?: string; 
        durationSeconds: number;
        warnings?: string[];
      }) => {
        console.log(`Scraping completed: ${result.itemsScraped} items scraped in ${result.durationSeconds} seconds`);
        
        // Update the job with the final status and statistics
        const endTime = new Date();
        await storage.updateScraperJob(job.id, {
          status: result.success ? "completed" : "failed",
          error: result.error || null,
          itemsScraped: result.itemsScraped,
          endTime,
          durationSeconds: result.durationSeconds
        });
        
        // Update the config's lastRun time
        await storage.updateScraperConfig(configId, {
          lastRun: endTime
        });
        
        // Log any warnings
        if (result.warnings && result.warnings.length > 0) {
          console.log(`Scraping warnings:`, result.warnings);
        }
      }).catch(async (error: Error) => {
        console.error("Scraping error:", error);
        
        // Update the job with the error status
        await storage.updateScraperJob(job.id, {
          status: "failed",
          error: error.message || "Unknown error occurred",
          endTime: new Date(),
          durationSeconds: 0
        });
      });
      
      res.json({
        message: "Scraping job started",
        jobId: job.id
      });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get all scraper jobs for a config
  app.get(`${apiPrefix}/configs/:configId/jobs`, async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      const jobs = await storage.getScraperJobs(configId);
      res.json(jobs);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get recent jobs
  app.get(`${apiPrefix}/jobs/recent`, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string || "5");
      const jobs = await storage.getRecentJobs(limit);
      res.json(jobs);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // ==== Scraped Data Routes ====
  
  // Get scraped products for a config
  app.get(`${apiPrefix}/configs/:configId/products`, async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      const limit = parseInt(req.query.limit as string || "20");
      const offset = parseInt(req.query.offset as string || "0");
      const search = req.query.search as string || "";
      
      let products;
      let total;
      
      if (search) {
        products = await storage.searchScrapedProducts(configId, search);
        total = products.length;
        products = products.slice(offset, offset + limit);
      } else {
        products = await storage.getScrapedProducts(configId, limit, offset);
        total = await storage.getProductCount(configId);
      }
      
      res.json({
        products,
        total,
        limit,
        offset
      });
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Get a specific scraped product
  app.get(`${apiPrefix}/products/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getScrapedProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Delete all scraped products for a config
  app.delete(`${apiPrefix}/configs/:configId/products`, async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      await storage.deleteScrapedProducts(configId);
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // ==== Export Routes ====
  
  // Export scraped data as CSV
  app.get(`${apiPrefix}/configs/:configId/export/csv`, async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      const products = await storage.getScrapedProducts(configId, 1000, 0);
      
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found for export" });
      }
      
      // Generate CSV
      const headers = ['title', 'price', 'description', 'rating', 'reviewCount', 'category', 'inStock', 'productUrl', 'dateScraped'];
      
      let csv = headers.join(',') + '\n';
      
      products.forEach(product => {
        const row = [
          `"${product.title.replace(/"/g, '""')}"`,
          `"${product.price || ''}"`,
          `"${(product.description || '').replace(/"/g, '""')}"`,
          `"${product.rating || ''}"`,
          `"${product.reviewCount || ''}"`,
          `"${product.category || ''}"`,
          product.inStock ? 'true' : 'false',
          `"${product.productUrl || ''}"`,
          `"${product.dateScraped.toISOString()}"`,
        ];
        
        csv += row.join(',') + '\n';
      });
      
      // Send CSV response
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="scraped-data-${configId}-${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Export scraped data as JSON
  app.get(`${apiPrefix}/configs/:configId/export/json`, async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      const products = await storage.getScrapedProducts(configId, 1000, 0);
      
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found for export" });
      }
      
      // Send JSON response
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="scraped-data-${configId}-${Date.now()}.json"`);
      res.json(products);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
