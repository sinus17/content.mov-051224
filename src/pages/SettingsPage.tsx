import { useEffect, useState } from 'react';
import { Settings, Database, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JsonImport } from '../components/JsonImport';
import { BulkRunInput } from '../components/BulkRunInput';
import { DeleteVideosButton } from '../components/DeleteVideosButton';
import { TestDataProcessor } from '../components/TestDataProcessor';
import { VideoStatsUpdater } from '../components/VideoStatsUpdater';
import { TikTokApiSection } from '../components/TikTokApiSection';
import { ApifyTestSection } from '../components/ApifyTestSection';

interface ConnectionStatus {
  isConnected: boolean;
  error: string | null;
  lastChecked: Date;
}

interface ConnectionCardProps {
  title: string;
  icon: typeof Database;
  status: ConnectionStatus;
  onRefresh: () => void;
}

function ConnectionCard({ title, icon: Icon, status, onRefresh }: ConnectionCardProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-cream" />
          <h3 className="text-lg font-medium text-text-primary">{title}</h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-surface-secondary rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-3">
        {status.isConnected ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
        <span className={status.isConnected ? "text-green-500" : "text-red-500"}>
          {status.isConnected ? 'Connected' : 'Connection Error'}
        </span>
      </div>

      {status.error && (
        <div className="bg-surface-secondary rounded-lg p-3 mb-3">
          <p className="text-sm text-red-400">Error: {status.error}</p>
        </div>
      )}

      <p className="text-sm text-text-secondary">
        Last checked: {status.lastChecked.toLocaleTimeString()}
      </p>
    </div>
  );
}

export function SettingsPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<ConnectionStatus>({
    isConnected: false,
    error: null,
    lastChecked: new Date()
  });

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('tracks').select('count');
      if (error) throw error;
      
      setSupabaseStatus({
        isConnected: true,
        error: null,
        lastChecked: new Date()
      });
    } catch (error) {
      setSupabaseStatus({
        isConnected: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Supabase',
        lastChecked: new Date()
      });
    }
  };

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="w-6 h-6 text-cream" />
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-medium text-text-primary mb-4">Database Connection</h2>
        
        <ConnectionCard
          title="Supabase Database"
          icon={Database}
          status={supabaseStatus}
          onRefresh={checkSupabaseConnection}
        />

        <div className="pt-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">TikTok API</h2>
          <TikTokApiSection />
        </div>

        <div className="pt-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">Browse AI Data Import</h2>
          <BulkRunInput />
        </div>

        <div className="pt-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">Test Data Processor</h2>
          <TestDataProcessor />
        </div>

        <div className="pt-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">Legacy Data Import</h2>
          <JsonImport />
        </div>

        <div className="pt-6">
          <h2 className="text-lg font-medium text-text-primary mb-4">Data Management</h2>
          <div className="space-y-6">
            <VideoStatsUpdater />
            <ApifyTestSection />
            
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Delete Videos</h3>
              <p className="text-text-secondary mb-4">
                This will delete all videos from the hot50_videos tables. This action cannot be undone.
              </p>
              <DeleteVideosButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}