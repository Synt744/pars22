import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { useScraperConfig, useScraperConfigs, useDataFields, useScraperJobs } from "@/hooks/use-scraper";

// Import the configuration and results panel components
const ConfigurationPanel = React.lazy(() => import("@/components/ConfigurationPanel").then(module => ({ default: module.ConfigurationPanel })));
const ResultsPanel = React.lazy(() => import("@/components/ResultsPanel").then(module => ({ default: module.ResultsPanel })));

export default function ScrapersPage() {
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const { data: config, isLoading: isLoadingConfig } = useScraperConfig(selectedConfigId);
  const { data: jobs } = useScraperJobs(selectedConfigId);
  
  const lastJob = jobs && jobs.length > 0 ? jobs[0] : null;

  const handleSelectConfig = (id: number | null) => {
    setSelectedConfigId(id);
  };

  return (
    <Layout>
      <React.Suspense fallback={<div>Loading...</div>}>
        <ConfigurationPanel 
          selectedConfigId={selectedConfigId} 
          onSelectConfig={handleSelectConfig} 
        />
      </React.Suspense>
      
      <React.Suspense fallback={<div>Loading...</div>}>
        <ResultsPanel 
          selectedConfig={config || null} 
          lastJob={lastJob}
          isLoadingConfig={isLoadingConfig}
        />
      </React.Suspense>
    </Layout>
  );
}
