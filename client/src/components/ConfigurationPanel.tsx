import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FieldSelector } from "@/components/ui/field-selector";
import { 
  useScraperConfigs, 
  useScraperConfig, 
  useCreateScraperConfig, 
  useUpdateScraperConfig,
  useDataFields,
  useStartScraping
} from "@/hooks/use-scraper";
import { ScraperConfig, InsertScraperConfig } from "@shared/schema";
import { ExternalLink, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConfigurationPanelProps {
  selectedConfigId: number | null;
  onSelectConfig: (id: number | null) => void;
}

export function ConfigurationPanel({ selectedConfigId, onSelectConfig }: ConfigurationPanelProps) {
  const { toast } = useToast();
  const { data: configs, isLoading: isLoadingConfigs } = useScraperConfigs();
  const { data: config } = useScraperConfig(selectedConfigId);
  const { data: dataFields, isLoading: isLoadingFields } = useDataFields(selectedConfigId);
  const createConfig = useCreateScraperConfig();
  const updateConfig = useUpdateScraperConfig();
  const startScraping = useStartScraping();
  
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(true);
  const [configName, setConfigName] = useState("");
  const [targetUrl, setTargetUrl] = useState("https://marketplace.example.com/products");
  const [pageType, setPageType] = useState("product_listing");
  const [paginationType, setPaginationType] = useState("standard");
  const [pageLimit, setPageLimit] = useState("5");
  const [requestInterval, setRequestInterval] = useState("3");
  const [proxyUrl, setProxyUrl] = useState("");
  const [useUserAgent, setUseUserAgent] = useState(true);
  const [useCloudflare, setUseCloudflare] = useState(false);
  const [useCaptcha, setUseCaptcha] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (config) {
      setConfigName(config.name);
      setTargetUrl(config.url);
      setPageType(config.pageType);
      setPaginationType(config.paginationType);
      setPageLimit(config.pageLimit.toString());
      setRequestInterval(config.requestInterval.toString());
      setProxyUrl(config.proxyUrl || "");
      setUseUserAgent(config.useUserAgentSpoofing);
      setUseCloudflare(config.useCloudflareBypass);
      setUseCaptcha(config.useCaptchaHandling);
      setIsEditing(true);
    } else {
      resetForm();
    }
  }, [config]);
  
  const resetForm = () => {
    setConfigName("");
    setTargetUrl("https://marketplace.example.com/products");
    setPageType("product_listing");
    setPaginationType("standard");
    setPageLimit("5");
    setRequestInterval("3");
    setProxyUrl("");
    setUseUserAgent(true);
    setUseCloudflare(false);
    setUseCaptcha(false);
    setIsEditing(false);
  };
  
  const handleNewScraper = () => {
    onSelectConfig(null);
    resetForm();
  };
  
  const handleSubmit = () => {
    if (!configName || !targetUrl) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const configData: InsertScraperConfig = {
      name: configName,
      url: targetUrl,
      pageType,
      paginationType,
      pageLimit: parseInt(pageLimit),
      requestInterval: parseInt(requestInterval),
      useUserAgentSpoofing: useUserAgent,
      useCloudflareBypass: useCloudflare,
      useCaptchaHandling: useCaptcha,
      proxyUrl: proxyUrl || null,
      userId: 1 // Default user ID
    };
    
    if (isEditing && selectedConfigId) {
      updateConfig.mutate({ id: selectedConfigId, config: configData });
    } else {
      createConfig.mutate(configData, {
        onSuccess: (data) => {
          onSelectConfig(data.id);
        }
      });
    }
  };
  
  const handleStartScraping = () => {
    if (selectedConfigId) {
      startScraping.mutate(selectedConfigId);
    } else {
      toast({
        title: "Error",
        description: "Please save the configuration first",
        variant: "destructive",
      });
    }
  };
  
  const toggleAdvancedOptions = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
  };
  
  return (
    <div className="w-full flex-shrink-0 border-r border-gray-200 dark:border-border bg-white dark:bg-card overflow-y-auto h-full">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold dark:text-gray-100">Scraper Setup</h1>
          <Button 
            onClick={handleNewScraper}
            size="sm" 
            className="px-3 py-1.5 bg-primary text-white text-sm rounded-md flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Scraper
          </Button>
        </div>

        <div className="space-y-6">
          {configs && configs.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <Label>Load Configuration</Label>
                <Select
                  value={selectedConfigId?.toString() || ""}
                  onValueChange={(value) => onSelectConfig(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved configuration..." />
                  </SelectTrigger>
                  <SelectContent>
                    {configs.map((config) => (
                      <SelectItem key={config.id} value={config.id.toString()}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        
          {/* Target Setup Section */}
          <Card>
            <div className="border-b border-gray-200 dark:border-border px-4 py-3 flex justify-between items-center">
              <h2 className="font-medium dark:text-gray-100">Target Website</h2>
              <span className="text-xs bg-warning/10 dark:bg-warning/20 text-warning px-2 py-1 rounded">
                Configuration
              </span>
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Scraper Name
                </Label>
                <Input
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="e.g. Amazon Electronics"
                  className="w-full"
                />
              </div>
            
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website URL
                </Label>
                <div className="flex">
                  <Input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="flex-1 rounded-r-none"
                    placeholder="https://example.com"
                  />
                  <Button 
                    variant="outline" 
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 rounded-l-none"
                    onClick={() => window.open(targetUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Page Type
                </Label>
                <Select value={pageType} onValueChange={setPageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product_listing">Product Listing</SelectItem>
                    <SelectItem value="product_detail">Product Detail</SelectItem>
                    <SelectItem value="category_page">Category Page</SelectItem>
                    <SelectItem value="search_results">Search Results</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pagination Type
                  </Label>
                  <Select value={paginationType} onValueChange={setPaginationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pagination type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="infinite_scroll">Infinite Scroll</SelectItem>
                      <SelectItem value="load_more">Load More Button</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Page Limit
                  </Label>
                  <Input
                    type="number"
                    value={pageLimit}
                    onChange={(e) => setPageLimit(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Extraction Section */}
          <Card>
            <div className="border-b border-gray-200 dark:border-border px-4 py-3 flex justify-between items-center">
              <h2 className="font-medium dark:text-gray-100">Data Extraction</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" /> Preview
              </Button>
            </div>
            <CardContent className="p-4 space-y-4">
              {selectedConfigId ? (
                <FieldSelector 
                  configId={selectedConfigId} 
                  fields={dataFields || []} 
                  isLoading={isLoadingFields} 
                />
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p>Save configuration first to add data fields</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Advanced Options Section */}
          <Card>
            <div 
              className="border-b border-gray-200 dark:border-border px-4 py-3 flex justify-between items-center cursor-pointer"
              onClick={toggleAdvancedOptions}
            >
              <h2 className="font-medium dark:text-gray-100">Advanced Options</h2>
              <Button variant="ghost" size="sm">
                {isAdvancedOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                )}
              </Button>
            </div>
            {isAdvancedOpen && (
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bot Protection Bypass
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="userAgent" 
                        checked={useUserAgent} 
                        onCheckedChange={(checked) => setUseUserAgent(!!checked)} 
                      />
                      <Label htmlFor="userAgent" className="text-sm text-gray-700 dark:text-gray-300">
                        User Agent Spoofing
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="cloudflare" 
                        checked={useCloudflare} 
                        onCheckedChange={(checked) => setUseCloudflare(!!checked)} 
                      />
                      <Label htmlFor="cloudflare" className="text-sm text-gray-700 dark:text-gray-300">
                        Cloudflare Protection Bypass
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="captcha" 
                        checked={useCaptcha} 
                        onCheckedChange={(checked) => setUseCaptcha(!!checked)} 
                      />
                      <Label htmlFor="captcha" className="text-sm text-gray-700 dark:text-gray-300">
                        CAPTCHA Handling
                      </Label>
                    </div>
                    <div className="mt-3">
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Request Interval (seconds)
                      </Label>
                      <Input
                        type="number"
                        value={requestInterval}
                        onChange={(e) => setRequestInterval(e.target.value)}
                        min="1"
                        max="60"
                        className="w-full"
                      />
                    </div>
                    <div className="mt-3">
                      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Proxy URL (optional)
                      </Label>
                      <Input
                        type="text"
                        value={proxyUrl}
                        onChange={(e) => setProxyUrl(e.target.value)}
                        placeholder="http://username:password@proxy.example.com:8080"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              className="flex-1" 
              onClick={handleSubmit}
              disabled={createConfig.isPending || updateConfig.isPending}
            >
              {isEditing ? "Update Configuration" : "Save Configuration"}
            </Button>
            <Button 
              className="flex-1 bg-success hover:bg-success/90 text-white"
              onClick={handleStartScraping}
              disabled={!selectedConfigId || startScraping.isPending}
            >
              <i className="ri-radar-line mr-1.5"></i>
              Start Scraping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigurationPanel;
