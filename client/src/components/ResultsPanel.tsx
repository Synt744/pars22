import React from 'react';
import { 
  RefreshCw, 
  Download, 
  ChevronDown,
  Database, 
  DollarSign, 
  Clock
} from "lucide-react";
import { format } from 'date-fns';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useScrapedProducts, useExportData } from "@/hooks/use-scraper";
import { ScraperConfig, ScraperJob } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResultsPanelProps {
  selectedConfig: ScraperConfig | null;
  lastJob: ScraperJob | null;
  isLoadingConfig: boolean;
}

export function ResultsPanel({ selectedConfig, lastJob, isLoadingConfig }: ResultsPanelProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const pageSize = 10;
  
  const { 
    data: productsData, 
    isLoading: isLoadingProducts, 
    refetch 
  } = useScrapedProducts(
    selectedConfig?.id || null, 
    pageSize, 
    (currentPage - 1) * pageSize,
    searchTerm
  );
  
  const exportCsv = useExportData('csv');
  const exportJson = useExportData('json');
  
  // Reset to first page when changing config
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setCategoryFilter("");
    setPriceFilter("");
  }, [selectedConfig?.id]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  const handleExport = (format: 'csv' | 'json') => {
    if (!selectedConfig) {
      toast({
        title: "Error",
        description: "No configuration selected",
        variant: "destructive",
      });
      return;
    }
    
    if (format === 'csv') {
      exportCsv.mutate(selectedConfig.id);
    } else {
      exportJson.mutate(selectedConfig.id);
    }
  };
  
  const handleDelete = (id: number) => {
    // This would connect to a delete API
    toast({
      title: "Not Implemented",
      description: "Product deletion is not implemented in this demo",
    });
  };
  
  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    // Would filter products by category in a real implementation
  };
  
  const handlePriceFilter = (range: string) => {
    setPriceFilter(range);
    // Would filter products by price range in a real implementation
  };
  
  const formatCurrency = (priceStr: string | null) => {
    if (!priceStr) return "$0.00";
    
    // Remove currency symbol and convert to number
    const numericValue = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
    
    if (isNaN(numericValue)) return "$0.00";
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(numericValue);
  };
  
  const calculateAveragePrice = (): string => {
    if (!productsData || productsData.products.length === 0) {
      return "$0.00";
    }
    
    let total = 0;
    let count = 0;
    
    productsData.products.forEach(product => {
      if (product.price) {
        const price = parseFloat(product.price.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(price)) {
          total += price;
          count++;
        }
      }
    });
    
    if (count === 0) return "$0.00";
    
    return formatCurrency((total / count).toString());
  };
  
  const getLastUpdated = (): string => {
    if (lastJob && lastJob.endTime) {
      return format(new Date(lastJob.endTime), "MMM d, h:mm a");
    }
    return "Never";
  };
  
  const getDurationDisplay = (): string => {
    if (lastJob && lastJob.durationSeconds) {
      return `${lastJob.durationSeconds}s`;
    }
    return "N/A";
  };
  
  const getItemsScraped = (): number => {
    if (lastJob && lastJob.itemsScraped) {
      return lastJob.itemsScraped;
    }
    return 0;
  };

  const getPriceChangeIndicator = (): React.ReactNode => {
    // In a real app, this would compare with historical data
    const change = Math.random() > 0.5 ? "increase" : "decrease";
    const percent = Math.floor(Math.random() * 10) + 1;
    
    if (change === "increase") {
      return (
        <div className="mt-2 flex items-center text-xs text-success">
          <i className="ri-arrow-up-line mr-1"></i>
          <span>{percent}% more than previous run</span>
        </div>
      );
    } else {
      return (
        <div className="mt-2 flex items-center text-xs text-red-500">
          <i className="ri-arrow-down-line mr-1"></i>
          <span>{percent}% less than previous run</span>
        </div>
      );
    }
  };
  
  return (
    <div className="w-full bg-background overflow-y-auto h-full">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {isLoadingConfig ? (
                  <div className="h-8 w-48 bg-gray-100 rounded animate-pulse"></div>
                ) : selectedConfig ? (
                  selectedConfig.name
                ) : (
                  "No Configuration Selected"
                )}
              </h2>
              <p className="text-sm text-gray-500">
                Last updated: {getLastUpdated()}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingProducts || !selectedConfig}
              >
                <RefreshCw className="h-4 w-4 mr-1.5" />
                Refresh
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!selectedConfig || !productsData || productsData.products.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <i className="ri-file-excel-line mr-2"></i>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <i className="ri-file-code-line mr-2"></i>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                  <p className="text-2xl font-semibold mt-1">
                    {isLoadingProducts ? (
                      <span className="h-8 w-12 bg-gray-100 dark:bg-muted rounded animate-pulse inline-block"></span>
                    ) : productsData ? (
                      productsData.total
                    ) : (
                      0
                    )}
                  </p>
                </div>
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-md">
                  <Database className="h-5 w-5 text-primary" />
                </div>
              </div>
              {productsData && productsData.total > 0 && (
                <div className="mt-2 flex items-center text-xs text-success">
                  <i className="ri-arrow-up-line mr-1"></i>
                  <span>{Math.floor(Math.random() * 20)}% more than previous run</span>
                </div>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Average Price</p>
                  <p className="text-2xl font-semibold mt-1">
                    {isLoadingProducts ? (
                      <span className="h-8 w-20 bg-gray-100 dark:bg-muted rounded animate-pulse inline-block"></span>
                    ) : (
                      calculateAveragePrice()
                    )}
                  </p>
                </div>
                <div className="p-2 bg-success/10 dark:bg-success/20 rounded-md">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
              </div>
              {productsData && productsData.total > 0 && getPriceChangeIndicator()}
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Scrape Duration</p>
                  <p className="text-2xl font-semibold mt-1">
                    {isLoadingConfig ? (
                      <span className="h-8 w-12 bg-gray-100 dark:bg-muted rounded animate-pulse inline-block"></span>
                    ) : (
                      getDurationDisplay()
                    )}
                  </p>
                </div>
                <div className="p-2 bg-warning/10 dark:bg-warning/20 rounded-md">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Last completed at {getLastUpdated()}</span>
              </div>
            </div>
          </div>

          {/* Data Table */}
          {selectedConfig ? (
            <DataTable 
              products={productsData?.products || []}
              total={productsData?.total || 0}
              loading={isLoadingProducts}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              onDelete={handleDelete}
              onCategoryFilter={handleCategoryFilter}
              onPriceFilter={handlePriceFilter}
            />
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-200 dark:border-border dark:bg-card">
              <div className="mb-4">
                <Database className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Select or create a scraper configuration to view extracted data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsPanel;
