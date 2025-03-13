import React, { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-gray-900 bg-opacity-50" onClick={closeMobileSidebar}>
          <div className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-sidebar" onClick={(e) => e.stopPropagation()}>
            <Sidebar isMobile={true} onClose={closeMobileSidebar} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-sidebar border-b border-gray-200 dark:border-border sticky top-0 left-0 right-0 z-10">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={toggleMobileSidebar}
              >
                <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </Button>
              <div className="flex items-center">
                <i className="ri-radar-line text-primary text-2xl mr-2"></i>
                <span className="text-xl font-semibold text-primary">WebHarvest</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="text-sm font-medium">JS</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex flex-1 overflow-hidden md:pt-0 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
