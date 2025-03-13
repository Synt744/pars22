import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertScraperConfigSchema, 
  updateScraperConfigSchema, 
  insertDataFieldSchema, 
  insertScraperJobSchema, 
  updateScraperJobSchema,
  insertUserSchema
} from "@shared/schema";
import { runScraper } from "./scraper";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Scraper Config Routes
  app.get("/api/scraper-configs", async (_req: Request, res: Response) => {
    try {
      const configs = await storage.getScraperConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching scraper configs:", error);
      res.status(500).json({ message: "Error fetching scraper configs" });
    }
  });

  app.get("/api/scraper-configs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const config = await storage.getScraperConfig(id);
      if (!config) {
        return res.status(404).json({ message: "Scraper config not found" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Error fetching scraper config:", error);
      res.status(500).json({ message: "Error fetching scraper config" });
    }
  });

  app.post("/api/scraper-configs", async (req: Request, res: Response) => {
    try {
      const result = insertScraperConfigSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid scraper config data", 
          errors: result.error.errors 
        });
      }
      
      const config = await storage.createScraperConfig(result.data);
      res.status(201).json(config);
    } catch (error) {
      console.error("Error creating scraper config:", error);
      res.status(500).json({ message: "Error creating scraper config" });
    }
  });

  app.patch("/api/scraper-configs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const result = updateScraperConfigSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid update data", 
          errors: result.error.errors 
        });
      }
      
      const updatedConfig = await storage.updateScraperConfig(id, result.data);
      if (!updatedConfig) {
        return res.status(404).json({ message: "Scraper config not found" });
      }
      
      res.json(updatedConfig);
    } catch (error) {
      console.error("Error updating scraper config:", error);
      res.status(500).json({ message: "Error updating scraper config" });
    }
  });

  app.delete("/api/scraper-configs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteScraperConfig(id);
      if (!success) {
        return res.status(404).json({ message: "Scraper config not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting scraper config:", error);
      res.status(500).json({ message: "Error deleting scraper config" });
    }
  });

  // Data Field Routes
  app.get("/api/scraper-configs/:configId/data-fields", async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      if (isNaN(configId)) {
        return res.status(400).json({ message: "Invalid config ID" });
      }
      
      const fields = await storage.getDataFields(configId);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching data fields:", error);
      res.status(500).json({ message: "Error fetching data fields" });
    }
  });

  app.post("/api/data-fields", async (req: Request, res: Response) => {
    try {
      const result = insertDataFieldSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid data field", 
          errors: result.error.errors 
        });
      }
      
      const field = await storage.createDataField(result.data);
      res.status(201).json(field);
    } catch (error) {
      console.error("Error creating data field:", error);
      res.status(500).json({ message: "Error creating data field" });
    }
  });

  app.patch("/api/data-fields/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const updatedField = await storage.updateDataField(id, req.body);
      if (!updatedField) {
        return res.status(404).json({ message: "Data field not found" });
      }
      
      res.json(updatedField);
    } catch (error) {
      console.error("Error updating data field:", error);
      res.status(500).json({ message: "Error updating data field" });
    }
  });

  app.delete("/api/data-fields/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteDataField(id);
      if (!success) {
        return res.status(404).json({ message: "Data field not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting data field:", error);
      res.status(500).json({ message: "Error deleting data field" });
    }
  });

  // Scraped Product Routes
  app.get("/api/scraper-configs/:configId/products", async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      if (isNaN(configId)) {
        return res.status(400).json({ message: "Invalid config ID" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const searchTerm = req.query.search as string;
      
      let products;
      if (searchTerm) {
        products = await storage.searchScrapedProducts(configId, searchTerm);
      } else {
        products = await storage.getScrapedProducts(configId, limit, offset);
      }
      
      const total = await storage.getProductCount(configId);
      
      res.json({
        products,
        total,
        limit,
        offset
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.delete("/api/scraper-configs/:configId/products", async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      if (isNaN(configId)) {
        return res.status(400).json({ message: "Invalid config ID" });
      }
      
      const success = await storage.deleteScrapedProducts(configId);
      if (!success) {
        return res.status(404).json({ message: "Config not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting products:", error);
      res.status(500).json({ message: "Error deleting products" });
    }
  });

  // Scraper Jobs Routes
  app.get("/api/scraper-configs/:configId/jobs", async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      if (isNaN(configId)) {
        return res.status(400).json({ message: "Invalid config ID" });
      }
      
      const jobs = await storage.getScraperJobs(configId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Error fetching jobs" });
    }
  });

  app.get("/api/recent-jobs", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const jobs = await storage.getRecentJobs(limit);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching recent jobs:", error);
      res.status(500).json({ message: "Error fetching recent jobs" });
    }
  });

  app.post("/api/scraper-configs/:configId/start", async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      if (isNaN(configId)) {
        return res.status(400).json({ message: "Invalid config ID" });
      }
      
      const config = await storage.getScraperConfig(configId);
      if (!config) {
        return res.status(404).json({ message: "Scraper config not found" });
      }
      
      // Create a new job entry
      const job = await storage.createScraperJob({
        configId,
        status: "running",
        itemsScraped: 0
      });
      
      // Start the scraper in the background
      runScraper(config, job, storage)
        .catch(err => console.error(`Error running scraper for config ${configId}:`, err));
      
      res.status(202).json(job);
    } catch (error) {
      console.error("Error starting scraper:", error);
      res.status(500).json({ message: "Error starting scraper" });
    }
  });

  // Export Data Routes
  app.get("/api/scraper-configs/:configId/export/:format", async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.configId);
      if (isNaN(configId)) {
        return res.status(400).json({ message: "Invalid config ID" });
      }
      
      const format = req.params.format;
      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({ message: "Invalid export format. Use 'json' or 'csv'" });
      }
      
      const config = await storage.getScraperConfig(configId);
      if (!config) {
        return res.status(404).json({ message: "Config not found" });
      }
      
      const products = await storage.getScrapedProducts(configId, 1000, 0);
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${config.name.replace(/\s+/g, '_')}_export.json"`);
        return res.json(products);
      } else {
        // CSV format
        const csvRows = [];
        
        // Headers
        const headers = ["ID", "Title", "Price", "Description", "Rating", "ReviewCount", "Category", "InStock", "ProductURL", "DateScraped"];
        csvRows.push(headers.join(','));
        
        // Data rows
        for (const product of products) {
          const row = [
            product.id,
            `"${product.title.replace(/"/g, '""')}"`,
            product.price || '',
            product.description ? `"${product.description.replace(/"/g, '""')}"` : '',
            product.rating || '',
            product.reviewCount || '',
            product.category || '',
            product.inStock ? 'Yes' : 'No',
            product.productUrl || '',
            product.dateScraped.toISOString()
          ];
          csvRows.push(row.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${config.name.replace(/\s+/g, '_')}_export.csv"`);
        return res.send(csvContent);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Error exporting data" });
    }
  });

  // User Routes (Basic)
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: result.error.errors 
        });
      }
      
      const user = await storage.createUser(result.data);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
