import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Database,
  Save,
  Mail,
  Lock,
  Key,
  Clock,
  Trash2
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been successfully updated."
    });
  };
  
  const handleDeleteAllData = () => {
    toast({
      title: "Not Implemented",
      description: "This feature is not implemented in the demo."
    });
  };
  
  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your account and application preferences
            </p>
          </div>
          
          <Tabs defaultValue="account">
            <TabsList className="mb-6">
              <TabsTrigger value="account" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="scraper" className="flex items-center">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Scraper Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center">
                <Database className="mr-2 h-4 w-4" />
                Data Management
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="john_smith" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="john@example.com" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Smith" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Notification Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notifyComplete" defaultChecked />
                        <Label htmlFor="notifyComplete">Notify when scraping job is completed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notifyFail" defaultChecked />
                        <Label htmlFor="notifyFail">Notify when scraping job fails</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notifySchedule" defaultChecked />
                        <Label htmlFor="notifySchedule">Notify before scheduled job begins</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="scraper">
              <Card>
                <CardHeader>
                  <CardTitle>Scraper Settings</CardTitle>
                  <CardDescription>
                    Configure default settings for your scrapers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Default Request Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="requestInterval">Default Request Interval (seconds)</Label>
                        <Input id="requestInterval" type="number" defaultValue="3" min="1" max="60" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pageLimit">Default Page Limit</Label>
                        <Input id="pageLimit" type="number" defaultValue="5" min="1" max="100" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="proxyUrl">Default Proxy URL (optional)</Label>
                      <Input id="proxyUrl" placeholder="http://username:password@proxy.example.com:8080" />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter a proxy URL to use for all scrapers by default. Individual scrapers can override this.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Anti-Detection Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="userAgent" defaultChecked />
                        <Label htmlFor="userAgent">Enable User Agent Spoofing by default</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cloudflare" />
                        <Label htmlFor="cloudflare">Enable Cloudflare Protection Bypass by default</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="captcha" />
                        <Label htmlFor="captcha">Enable CAPTCHA Handling by default</Label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      These settings will be applied to all new scrapers you create.
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center">
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      API Keys
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">Your API Key</Label>
                      <div className="flex">
                        <Input id="apiKey" value="c8e0b6e4-3a2d-4f68-b5c2-29b7e4d9b8f7" readOnly className="rounded-r-none" />
                        <Button variant="outline" className="rounded-l-none">Copy</Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Use this API key to access the WebHarvest API programmatically.
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Regenerate API Key</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Two-Factor Authentication
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="twoFactor" />
                      <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Add an extra layer of security to your account by requiring a verification code when you sign in.
                    </p>
                    <Button variant="outline" size="sm" disabled>Setup Two-Factor Authentication</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Manage your stored data and export options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center">
                      <Database className="mr-2 h-4 w-4" />
                      Data Storage
                    </h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Storage Usage</span>
                        <span className="text-sm">42.3 MB / 1 GB</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full w-[4.2%]"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="autoDelete" />
                      <Label htmlFor="autoDelete">Automatically delete data older than 30 days</Label>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Data Retention
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="retention">Keep scraped data for</Label>
                      <select id="retention" className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 dark:text-gray-300">
                        <option value="forever">Forever</option>
                        <option value="year">1 Year</option>
                        <option value="6months">6 Months</option>
                        <option value="30days">30 Days</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Older data will be automatically removed from the system.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-red-500 flex items-center">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Danger Zone
                    </h3>
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Delete All Data</h4>
                      <p className="text-xs text-gray-500 mb-4">
                        This will permanently delete all your scraper configurations, jobs, and scraped data. This action cannot be undone.
                      </p>
                      <Button variant="destructive" size="sm" onClick={handleDeleteAllData}>
                        Delete All Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
