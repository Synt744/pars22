import { Link, useLocation } from "wouter";
import { useRecentJobs } from "@/hooks/use-scraper";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { data: recentJobs, isLoading } = useRecentJobs();

  const navItems = [
    { name: "Dashboard", icon: "ri-dashboard-line", path: "/" },
    { name: "Web Scrapers", icon: "ri-radar-line", path: "/scrapers" },
    { name: "Data Collections", icon: "ri-database-2-line", path: "/collections" },
    { name: "Scheduled Tasks", icon: "ri-time-line", path: "/scheduled" },
    { name: "Job History", icon: "ri-history-line", path: "/history" },
    { name: "Settings", icon: "ri-settings-4-line", path: "/settings" },
  ];

  const LinkItem = ({ name, icon, path }: { name: string, icon: string, path: string }) => {
    const isActive = location === path;
    
    return (
      <Link 
        href={path} 
        onClick={isMobile ? onClose : undefined}
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
          isActive 
            ? "text-primary bg-primary/10 dark:bg-primary/20" 
            : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
        )}
      >
        <i className={cn(
          `${icon} mr-3 text-lg`,
          isActive ? "text-primary" : "text-gray-500 dark:text-gray-400 group-hover:text-primary"
        )}></i>
        {name}
      </Link>
    );
  };

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 dark:border-border bg-white dark:bg-sidebar h-full">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-border">
        <div className="flex items-center">
          <i className="ri-radar-line text-primary text-2xl mr-2"></i>
          <span className="text-xl font-semibold text-primary">WebHarvest</span>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <LinkItem 
              key={item.name} 
              name={item.name} 
              icon={item.icon} 
              path={item.path} 
            />
          ))}
        </nav>
        
        <div className="pt-4 mt-6 border-t border-gray-200 dark:border-border">
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recent Jobs
            </h3>
            {isLoading ? (
              <div className="mt-2 space-y-2">
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {recentJobs && recentJobs.length > 0 ? (
                  recentJobs.map(job => (
                    <Link 
                      key={job.id} 
                      href={`/jobs/${job.id}`}
                      className="block px-3 py-2 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {job.configName || `Scraper #${job.configId}`} ({formatDistanceToNow(new Date(job.startTime), { addSuffix: true })})
                    </Link>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">
                    No recent jobs found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="text-sm font-medium">JS</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium dark:text-gray-200">John Smith</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
