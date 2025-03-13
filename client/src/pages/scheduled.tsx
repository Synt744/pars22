import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScraperConfigs } from "@/hooks/use-scraper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarClock, Plus, Calendar, Clock, Trash2, AlarmClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock scheduled task type (would be in schema.ts in a real app)
interface ScheduledTask {
  id: number;
  configId: number;
  configName: string;
  frequency: string;
  days: string[];
  time: string;
  active: boolean;
}

export default function ScheduledPage() {
  const { toast } = useToast();
  const { data: configs, isLoading } = useScraperConfigs();
  
  // Mock data - in a real app, this would come from the API
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([
    {
      id: 1,
      configId: 1,
      configName: "Amazon Electronics",
      frequency: "daily",
      days: ["monday", "wednesday", "friday"],
      time: "09:00",
      active: true
    },
    {
      id: 2,
      configId: 2,
      configName: "Etsy Handmade Items",
      frequency: "weekly",
      days: ["saturday"],
      time: "22:00",
      active: false
    }
  ]);

  // New task form state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("daily");
  const [days, setDays] = useState<string[]>(["monday"]);
  const [time, setTime] = useState<string>("12:00");
  
  const daysOfWeek = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" }
  ];

  const handleToggleActive = (id: number) => {
    setScheduledTasks(prev => 
      prev.map(task => task.id === id ? { ...task, active: !task.active } : task)
    );
    
    toast({
      title: "Task Updated",
      description: "The scheduled task status has been updated."
    });
  };

  const handleDeleteTask = (id: number) => {
    setScheduledTasks(prev => prev.filter(task => task.id !== id));
    
    toast({
      title: "Task Deleted",
      description: "The scheduled task has been deleted."
    });
  };

  const handleCreateTask = () => {
    if (!selectedConfigId || !time) {
      toast({
        title: "Validation Error",
        description: "Please select a scraper and set a time.",
        variant: "destructive"
      });
      return;
    }
    
    const configId = parseInt(selectedConfigId);
    const config = configs?.find(c => c.id === configId);
    
    if (!config) {
      toast({
        title: "Error",
        description: "Selected scraper not found.",
        variant: "destructive"
      });
      return;
    }
    
    const newTask: ScheduledTask = {
      id: Math.max(0, ...scheduledTasks.map(t => t.id)) + 1,
      configId,
      configName: config.name,
      frequency,
      days: frequency === "daily" ? [] : days,
      time,
      active: true
    };
    
    setScheduledTasks(prev => [...prev, newTask]);
    setIsOpen(false);
    
    toast({
      title: "Task Created",
      description: "The scheduled task has been created successfully."
    });
    
    // Reset form
    setSelectedConfigId("");
    setFrequency("daily");
    setDays(["monday"]);
    setTime("12:00");
  };
  
  const handleDayToggle = (day: string) => {
    setDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };
  
  const getTaskScheduleText = (task: ScheduledTask) => {
    if (task.frequency === "daily") {
      return `Every day at ${task.time}`;
    } else {
      const dayLabels = task.days.map(day => 
        day.charAt(0).toUpperCase() + day.slice(1)
      ).join(", ");
      return `Every ${dayLabels} at ${task.time}`;
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Scheduled Tasks</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Automate your scraper runs with scheduled tasks
              </p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Create Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Scheduled Task</DialogTitle>
                  <DialogDescription>
                    Set up a recurring schedule for your scraper to run automatically.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="scraper">Select Scraper</Label>
                    <Select
                      value={selectedConfigId}
                      onValueChange={setSelectedConfigId}
                    >
                      <SelectTrigger id="scraper">
                        <SelectValue placeholder="Select a scraper" />
                      </SelectTrigger>
                      <SelectContent>
                        {configs?.map(config => (
                          <SelectItem key={config.id} value={config.id.toString()}>
                            {config.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={frequency}
                      onValueChange={setFrequency}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {frequency === "weekly" && (
                    <div className="space-y-2">
                      <Label>Days of Week</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {daysOfWeek.map(day => (
                          <div key={day.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={day.id} 
                              checked={days.includes(day.id)} 
                              onCheckedChange={() => handleDayToggle(day.id)}
                            />
                            <label htmlFor={day.id} className="text-sm cursor-pointer">
                              {day.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input 
                      id="time" 
                      type="time" 
                      value={time} 
                      onChange={e => setTime(e.target.value)} 
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>
                    Create Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(2).fill(0).map((_, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div className="space-y-2 mb-3 sm:mb-0">
                        <div className="h-5 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                        <div className="h-4 w-56 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                        <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : scheduledTasks.length > 0 ? (
                <div className="space-y-4">
                  {scheduledTasks.map((task) => (
                    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                      <div className="space-y-1 mb-3 sm:mb-0">
                        <h3 className="font-medium flex items-center">
                          <AlarmClock className="h-4 w-4 mr-2 text-primary" />
                          {task.configName}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {getTaskScheduleText(task)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant={task.active ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleActive(task.id)}
                        >
                          {task.active ? "Active" : "Inactive"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarClock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Scheduled Tasks</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Create a schedule to automate your scraper runs at regular intervals.
                  </p>
                  <Button onClick={() => setIsOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Create Your First Schedule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scheduled tasks allow you to automate your scraping operations. 
                  The server will automatically run your scraper according to the schedule you set up, 
                  collecting fresh data without manual intervention.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" /> 
                      Frequency Options
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6 list-disc">
                      <li>Daily - runs every day at the specified time</li>
                      <li>Weekly - runs on selected days of the week</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2 text-primary" /> 
                      Best Practices
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6 list-disc">
                      <li>Schedule during off-peak hours when possible</li>
                      <li>Use longer intervals for sites with rate limiting</li>
                      <li>Monitor job history for any failures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
