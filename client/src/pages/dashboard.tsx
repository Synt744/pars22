import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScraperConfigs, useRecentJobs } from "@/hooks/use-scraper";
import { formatDistanceToNow } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Radar, Activity, Clock, Database, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: configs, isLoading: isLoadingConfigs } = useScraperConfigs();
  const { data: recentJobs, isLoading: isLoadingJobs } = useRecentJobs(10);
  const { toast } = useToast();

  // Mock data for charts
  const chartData = [
    { name: "Mon", products: 18 },
    { name: "Tue", products: 25 },
    { name: "Wed", products: 32 },
    { name: "Thu", products: 20 },
    { name: "Fri", products: 15 },
    { name: "Sat", products: 22 },
    { name: "Sun", products: 30 },
  ];

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Overview of your scraper activities
              </p>
            </div>
            <Button asChild>
              <Link href="/scrapers">
                <Radar className="mr-2 h-4 w-4" /> Create New Scraper
              </Link>
            </Button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Scrapers
                    </p>
                    <p className="text-2xl font-semibold mt-1">
                      {isLoadingConfigs ? (
                        <Skeleton className="h-8 w-8" />
                      ) : (
                        configs?.length || 0
                      )}
                    </p>
                  </div>
                  <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-full">
                    <Radar className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Active Jobs
                    </p>
                    <p className="text-2xl font-semibold mt-1">
                      {isLoadingJobs ? (
                        <Skeleton className="h-8 w-8" />
                      ) : (
                        recentJobs?.filter(job => job.status === "running").length || 0
                      )}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-full">
                    <Activity className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Data Points
                    </p>
                    <p className="text-2xl font-semibold mt-1">152</p>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-full">
                    <Database className="h-6 w-6 text-green-600 dark:text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last Scrape
                    </p>
                    <p className="text-2xl font-semibold mt-1">
                      {isLoadingJobs ? (
                        <Skeleton className="h-8 w-24" />
                      ) : recentJobs && recentJobs.length > 0 ? (
                        formatDistanceToNow(new Date(recentJobs[0].startTime), { addSuffix: true })
                      ) : (
                        "Never"
                      )}
                    </p>
                  </div>
                  <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-full">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Recent Jobs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Products Scraped (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="products" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingJobs ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-start">
                        <Skeleton className="h-8 w-8 rounded-full mr-3" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))
                  ) : recentJobs && recentJobs.length > 0 ? (
                    recentJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-start">
                        <div className={`p-2 rounded-full ${
                          job.status === 'completed' ? 'bg-green-100 dark:bg-green-800/30' :
                          job.status === 'failed' ? 'bg-red-100 dark:bg-red-800/30' :
                          'bg-amber-100 dark:bg-amber-800/30'
                        } mr-3`}>
                          {job.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                          ) : job.status === 'failed' ? (
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                          ) : (
                            <Activity className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{job.configName || `Job #${job.id}`}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(job.startTime), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No jobs found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scraper List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Scrapers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingConfigs ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-60" />
                      </div>
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : configs && configs.length > 0 ? (
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div>
                        <h3 className="font-medium">{config.name}</h3>
                        <p className="text-sm text-gray-500">
                          {config.lastRun ? (
                            `Last run ${formatDistanceToNow(new Date(config.lastRun), { addSuffix: true })}`
                          ) : (
                            'Never run'
                          )}
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/scrapers?id=${config.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <Radar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-medium mb-1">No scrapers found</h3>
                  <p className="text-sm mb-4">Get started by creating your first web scraper</p>
                  <Button asChild>
                    <Link href="/scrapers">
                      <Radar className="mr-2 h-4 w-4" /> Create New Scraper
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
