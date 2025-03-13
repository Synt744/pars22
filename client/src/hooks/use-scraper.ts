import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { 
  ScraperConfig, 
  InsertScraperConfig, 
  UpdateScraperConfig,
  DataField,
  InsertDataField,
  ScrapedProduct,
  ScraperJob
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Scraper Configuration Hooks
export function useScraperConfigs() {
  return useQuery<ScraperConfig[]>({
    queryKey: ['/api/scraper-configs'],
  });
}

export function useScraperConfig(id: number | null) {
  return useQuery<ScraperConfig>({
    queryKey: id ? [`/api/scraper-configs/${id}`] : null,
    enabled: id !== null,
  });
}

export function useCreateScraperConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (config: InsertScraperConfig) => {
      const res = await apiRequest('POST', '/api/scraper-configs', config);
      return (await res.json()) as ScraperConfig;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraper-configs'] });
      toast({
        title: "Success",
        description: `Scraper "${data.name}" created successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create scraper: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateScraperConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, config }: { id: number; config: Partial<UpdateScraperConfig> }) => {
      const res = await apiRequest('PATCH', `/api/scraper-configs/${id}`, config);
      return (await res.json()) as ScraperConfig;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraper-configs'] });
      queryClient.invalidateQueries({ queryKey: [`/api/scraper-configs/${data.id}`] });
      toast({
        title: "Success",
        description: `Scraper "${data.name}" updated successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update scraper: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteScraperConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/scraper-configs/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraper-configs'] });
      toast({
        title: "Success",
        description: "Scraper deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete scraper: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
}

// Data Field Hooks
export function useDataFields(configId: number | null) {
  return useQuery<DataField[]>({
    queryKey: configId ? [`/api/scraper-configs/${configId}/data-fields`] : null,
    enabled: configId !== null,
  });
}

export function useCreateDataField() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (field: InsertDataField) => {
      const res = await apiRequest('POST', '/api/data-fields', field);
      return (await res.json()) as DataField;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/scraper-configs/${data.configId}/data-fields`] });
      toast({
        title: "Success",
        description: `Field "${data.name}" added successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add field: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDataField() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, field, configId }: { id: number; field: Partial<InsertDataField>; configId: number }) => {
      const res = await apiRequest('PATCH', `/api/data-fields/${id}`, field);
      return { data: (await res.json()) as DataField, configId };
    },
    onSuccess: ({ data, configId }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/scraper-configs/${configId}/data-fields`] });
      toast({
        title: "Success",
        description: `Field "${data.name}" updated successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update field: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDataField() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, configId }: { id: number; configId: number }) => {
      await apiRequest('DELETE', `/api/data-fields/${id}`);
      return configId;
    },
    onSuccess: (configId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/scraper-configs/${configId}/data-fields`] });
      toast({
        title: "Success",
        description: "Field deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete field: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
}

// Product Data Hooks
export function useScrapedProducts(configId: number | null, limit = 20, offset = 0, searchTerm = "") {
  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());
  
  if (searchTerm) {
    queryParams.append('search', searchTerm);
  }
  
  return useQuery<{ products: ScrapedProduct[], total: number, limit: number, offset: number }>({
    queryKey: configId ? [`/api/scraper-configs/${configId}/products`, limit, offset, searchTerm] : null,
    enabled: configId !== null,
  });
}

export function useDeleteScrapedProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (configId: number) => {
      await apiRequest('DELETE', `/api/scraper-configs/${configId}/products`);
      return configId;
    },
    onSuccess: (configId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/scraper-configs/${configId}/products`] });
      toast({
        title: "Success",
        description: "Products deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete products: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
}

// Export Data Hooks
export function useExportData(format: 'csv' | 'json') {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (configId: number) => {
      const response = await fetch(`/api/scraper-configs/${configId}/export/${format}`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `export.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { configId, format };
    },
    onSuccess: ({ format }) => {
      toast({
        title: "Success",
        description: `Data exported as ${format.toUpperCase()} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to export data: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
}

// Scraper Job Hooks
export function useScraperJobs(configId: number | null) {
  return useQuery<ScraperJob[]>({
    queryKey: configId ? [`/api/scraper-configs/${configId}/jobs`] : null,
    enabled: configId !== null,
  });
}

export function useRecentJobs(limit = 5) {
  return useQuery<ScraperJob[]>({
    queryKey: [`/api/recent-jobs?limit=${limit}`],
  });
}

export function useStartScraping() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (configId: number) => {
      const res = await apiRequest('POST', `/api/scraper-configs/${configId}/start`, {});
      return { job: (await res.json()) as ScraperJob, configId };
    },
    onSuccess: ({ configId }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/scraper-configs/${configId}/jobs`] });
      queryClient.invalidateQueries({ queryKey: [`/api/recent-jobs`] });
      
      toast({
        title: "Scraper Started",
        description: "The scraper job has been started successfully",
      });
      
      // Poll for job updates
      const intervalId = setInterval(async () => {
        try {
          const response = await fetch(`/api/scraper-configs/${configId}/jobs`);
          const jobs = await response.json() as ScraperJob[];
          const latestJob = jobs[0];
          
          if (latestJob && (latestJob.status === 'completed' || latestJob.status === 'failed')) {
            clearInterval(intervalId);
            
            queryClient.invalidateQueries({ queryKey: [`/api/scraper-configs/${configId}/products`] });
            queryClient.invalidateQueries({ queryKey: [`/api/scraper-configs/${configId}`] });
            
            toast({
              title: latestJob.status === 'completed' ? "Scraping Completed" : "Scraping Failed",
              description: latestJob.status === 'completed' 
                ? `Successfully scraped ${latestJob.itemsScraped} items`
                : `Scraping failed: ${latestJob.error || "Unknown error"}`,
              variant: latestJob.status === 'completed' ? "default" : "destructive",
            });
          }
        } catch (error) {
          console.error("Error polling job status:", error);
        }
      }, 5000);
      
      // Clear interval after 5 minutes maximum
      setTimeout(() => clearInterval(intervalId), 5 * 60 * 1000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to start scraper: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
}
