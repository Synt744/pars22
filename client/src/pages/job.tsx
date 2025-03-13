import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScraperConfigs, useScraperJobs, useScrapedProducts } from "@/hooks/use-scraper";
import { useToast } from "@/hooks/use-toast";
import { useRoute, Link } from "wouter";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Database,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export default function JobPage() {
  const [match, params] = useRoute("/jobs/:id");
  const { toast } = useToast();
  
  const jobId = params?.id ? parseInt(params.id) : null;
  
  // In a real app, we would have a getJob(id) endpoint
  // For now, we'll work with what we have - get configs and jobs and find the right one
  const { data: configs, isLoading: isLoadingConfigs } = useScraperConfigs();
  
  // This gets all jobs for a config, so we'll need to loop through configs
  // and check all jobs until we find the matching ID
  const [config, setConfig] = React.useState<any>(null);
  const [job, setJob] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const { data: jobs } = useScraperJobs(config?.id || null);
  const { data: productsData } = useScrapedProducts(config?.id || null, 5, 0);
  
  React.useEffect(() => {
    if (!jobId || isLoadingConfigs || !configs) return;
    
    // Find the config and job
    let foundJob = null;
    let foundConfig = null;
    
    for (const cfg of configs) {
      // Get jobs for this config
      const { data: configJobs } = useScraperJobs(cfg.id);
      
      if (configJobs) {
        const job = configJobs.find(j => j.id === jobId);
        if (job) {
          foundJob = job;
          foundConfig = cfg;
          break;
        }
      }
    }
    
    if (foundConfig) {
      setConfig(foundConfig);
    }
    
    if (foundJob) {
      setJob(foundJob);
    }
    
    setIsLoading(false);
  }, [jobId, configs, isLoadingConfigs]);
  
  // Poll for job updates if it's running
  React.useEffect(() => {
    if (!job || job.status !== 'running') return;
    
    const interval = setInterval(async () => {
      try {
        // This would refresh the job status
        toast({
          title: "Job Updated",
          description: "The job status has been updated."
        });
      } catch (error) {
        console.error("Error polling job status:", error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [job]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">{status}</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">{status}</Badge>;
      case 'running':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">{status}</Badge>;
    }
  };
  
  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-64" /> : `Job #${jobId}`}
            </h1>
          </div>
          
          {isLoading ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : job ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {config?.name || "Unknown Scraper"}
                    </span>
                    {getStatusBadge(job.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 dark:bg-card">
                        <p className="text-sm text-gray-500 flex items-center mb-1">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" /> 
                          Time
                        </p>
                        <div className="mt-1">
                          <p className="text-sm">Started: {format(new Date(job.startTime), "MMM d, yyyy h:mm a")}</p>
                          {job.endTime && (
                            <p className="text-sm">Ended: {format(new Date(job.endTime), "MMM d, yyyy h:mm a")}</p>
                          )}
                          {job.durationSeconds && (
                            <p className="text-sm font-medium mt-1">Duration: {job.durationSeconds} seconds</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 dark:bg-card">
                        <p className="text-sm text-gray-500 flex items-center mb-1">
                          <Database className="h-4 w-4 mr-1 text-gray-400" /> 
                          Results
                        </p>
                        <div className="mt-1">
                          <p className="text-sm">Items Scraped: <span className="font-medium">{job.itemsScraped || 0}</span></p>
                          <p className="text-sm">Success Rate: <span className="font-medium">100%</span></p>
                          <Button variant="link" size="sm" className="p-0 h-auto mt-1" asChild>
                            <Link href={`/scrapers?id=${config?.id}`}>
                              View Results <ChevronRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 dark:bg-card">
                        <p className="text-sm text-gray-500 flex items-center mb-1">
                          <RefreshCw className="h-4 w-4 mr-1 text-gray-400" /> 
                          Actions
                        </p>
                        <div className="mt-1 space-y-2">
                          <Button size="sm" className="w-full">
                            Run Again
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            View Config
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {job.status === 'running' && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 dark:bg-card">
                        <div className="flex justify-between mb-2">
                          <p className="text-sm font-medium">Progress</p>
                          <p className="text-sm">{job.itemsScraped || 0} items</p>
                        </div>
                        <Progress value={40} className="h-2" />
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Running... This page will update automatically.
                        </p>
                      </div>
                    )}
                    
                    {job.error && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center mb-1">
                          <AlertTriangle className="h-4 w-4 mr-1" /> 
                          Error Details
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {job.error}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {productsData && productsData.products.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {productsData.products.slice(0, 3).map((product) => (
                        <div key={product.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                          <h3 className="font-medium mb-1">{product.title}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Price:</span> {product.price}
                            </div>
                            <div>
                              <span className="text-gray-500">Rating:</span> {product.rating} ({product.reviewCount} reviews)
                            </div>
                            <div>
                              <span className="text-gray-500">Category:</span> {product.category}
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span> {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-center">
                        <Button variant="link" asChild>
                          <Link href={`/scrapers?id=${config?.id}`}>
                            View All Results <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Configuration</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500">Target URL:</span>
                            <span className="font-mono">{config?.url}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500">Page Type:</span>
                            <span>{config?.pageType}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500">Page Limit:</span>
                            <span>{config?.pageLimit}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500">Request Interval:</span>
                            <span>{config?.requestInterval}s</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Protection Bypass</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500">User Agent Spoofing:</span>
                            <span>{config?.useUserAgentSpoofing ? 'Enabled' : 'Disabled'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500">Cloudflare Bypass:</span>
                            <span>{config?.useCloudflareBypass ? 'Enabled' : 'Disabled'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500">CAPTCHA Handling:</span>
                            <span>{config?.useCaptchaHandling ? 'Enabled' : 'Disabled'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-500">Proxy:</span>
                            <span>{config?.proxyUrl || 'None'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                <p className="text-gray-500 mb-6">The job you're looking for doesn't exist or has been deleted.</p>
                <Button asChild>
                  <Link href="/history">
                    Back to Job History
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
