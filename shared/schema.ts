import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Scraper configuration model
export const scraperConfigs = pgTable("scraper_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  pageType: text("page_type").notNull().default("product_listing"),
  paginationType: text("pagination_type").notNull().default("standard"),
  pageLimit: integer("page_limit").notNull().default(5),
  requestInterval: integer("request_interval").notNull().default(3),
  useUserAgentSpoofing: boolean("use_user_agent_spoofing").notNull().default(true),
  useCloudflareBypass: boolean("use_cloudflare_bypass").notNull().default(false),
  useCaptchaHandling: boolean("use_captcha_handling").notNull().default(false),
  proxyUrl: text("proxy_url"),
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  lastRun: timestamp("last_run"),
  userId: integer("user_id").references(() => users.id),
});

export const insertScraperConfigSchema = createInsertSchema(scraperConfigs).omit({
  id: true,
  dateCreated: true,
  lastRun: true,
});

export const updateScraperConfigSchema = createInsertSchema(scraperConfigs).omit({
  id: true,
  dateCreated: true,
}).partial();

export type InsertScraperConfig = z.infer<typeof insertScraperConfigSchema>;
export type UpdateScraperConfig = z.infer<typeof updateScraperConfigSchema>;
export type ScraperConfig = typeof scraperConfigs.$inferSelect;

// Data field model
export const dataFields = pgTable("data_fields", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").notNull().references(() => scraperConfigs.id),
  name: text("name").notNull(),
  selector: text("selector").notNull(),
  status: text("status").notNull().default("active"),
  dateCreated: timestamp("date_created").notNull().defaultNow(),
});

export const insertDataFieldSchema = createInsertSchema(dataFields).omit({
  id: true,
  dateCreated: true,
});

export type InsertDataField = z.infer<typeof insertDataFieldSchema>;
export type DataField = typeof dataFields.$inferSelect;

// Scraped product model
export const scrapedProducts = pgTable("scraped_products", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").notNull().references(() => scraperConfigs.id),
  title: text("title").notNull(),
  price: text("price"),
  description: text("description"),
  rating: text("rating"),
  reviewCount: text("review_count"),
  imageUrl: text("image_url"),
  productUrl: text("product_url"),
  category: text("category"),
  inStock: boolean("in_stock").notNull().default(true),
  additionalData: jsonb("additional_data").notNull().default({}),
  dateScraped: timestamp("date_scraped").notNull().defaultNow(),
});

export const insertScrapedProductSchema = createInsertSchema(scrapedProducts).omit({
  id: true,
  dateScraped: true,
});

export type InsertScrapedProduct = z.infer<typeof insertScrapedProductSchema>;
export type ScrapedProduct = typeof scrapedProducts.$inferSelect;

// Scraper job model
export const scraperJobs = pgTable("scraper_jobs", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").notNull().references(() => scraperConfigs.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  itemsScraped: integer("items_scraped").default(0),
  error: text("error"),
  durationSeconds: integer("duration_seconds"),
});

export const insertScraperJobSchema = createInsertSchema(scraperJobs).omit({
  id: true,
  startTime: true,
  endTime: true,
  durationSeconds: true,
});

export const updateScraperJobSchema = createInsertSchema(scraperJobs).omit({
  id: true,
  startTime: true,
}).partial();

export type InsertScraperJob = z.infer<typeof insertScraperJobSchema>;
export type UpdateScraperJob = z.infer<typeof updateScraperJobSchema>;
export type ScraperJob = typeof scraperJobs.$inferSelect;
