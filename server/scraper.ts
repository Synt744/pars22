import type { ScraperConfig, ScraperJob } from '@shared/schema';
import type { IStorage } from './storage';
import { EnhancedWebScraper } from './services/scraperService';

/**
 * Run the scraper with the given configuration and job
 * This function now uses the enhanced scraper service that implements
 * protection bypass capabilities and advanced data extraction
 */
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
    
    // Use the enhanced scraper service
    const scraper = new EnhancedWebScraper(config, dataFields, job.id);
    const result = await scraper.scrape();
    
    // Update job with results
    const endTime = new Date();
    const jobStatus = result.success ? "completed" : "failed";
    
    const updatedJob = await storage.updateScraperJob(job.id, {
      status: jobStatus,
      endTime,
      itemsScraped: result.itemsScraped,
      error: result.error || null,
      durationSeconds: result.durationSeconds
    });
    
    if (!updatedJob) {
      throw new Error(`Failed to update job with ID: ${job.id}`);
    }
    
    if (result.success) {
      console.log(`Scraping completed: ${result.itemsScraped} items scraped in ${result.durationSeconds}s`);
    } else {
      console.error(`Scraping failed: ${result.error}`);
    }
    
    // Log any warnings
    if (result.warnings && result.warnings.length > 0) {
      console.log('Scraping warnings:');
      result.warnings.forEach(warning => console.log(`- ${warning}`));
    }
    
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
