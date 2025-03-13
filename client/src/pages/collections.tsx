import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScraperConfigs } from "@/hooks/use-scraper";
import { formatDistanceToNow } from "date-fns";
import { Database, ArrowRight, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export default function CollectionsPage() {
  const { data: configs, isLoading } = useScraperConfigs();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredConfigs = React.useMemo(() => {
    if (!configs) return [];
    if (!searchTerm) return configs;
    
    return configs.filter(config => 
      config.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [configs, searchTerm]);

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Data Collections</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your scraped data
              </p>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search collections..."
                className="pl-9 pr-4 py-2 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading state
              Array(6).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-28" />
                      </div>
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredConfigs.length > 0 ? (
              // Data collections
              filteredConfigs.map((config) => (
                <Card key={config.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Source</span>
                        <span className="text-sm font-medium truncate max-w-[180px]" title={config.url}>
                          {new URL(config.url).hostname}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Last Updated</span>
                        <span className="text-sm font-medium">
                          {config.lastRun 
                            ? formatDistanceToNow(new Date(config.lastRun), { addSuffix: true })
                            : "Never"}
                        </span>
                      </div>
                      <Button className="w-full" asChild>
                        <Link href={`/scrapers?id=${config.id}`}>
                          View Data <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Empty state
              <div className="col-span-full">
                <Card className="p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Database className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No collections found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm 
                      ? `No collections match the search term "${searchTerm}"`
                      : "Create a new scraper to start collecting data from websites."}
                  </p>
                  {!searchTerm && (
                    <Button asChild>
                      <Link href="/scrapers">Create New Scraper</Link>
                    </Button>
                  )}
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </Button>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
