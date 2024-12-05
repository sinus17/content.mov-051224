import { useState } from 'react';
import { Upload } from 'lucide-react';
import { ImportStatus } from '../types/browse-ai';
import { importBrowseAiData } from '../services/import';
import { JsonParsingLog } from './JsonParsingLog';

export function JsonImport() {
  const [status, setStatus] = useState<ImportStatus>({
    isImporting: false,
    success: false,
    error: null,
    stats: {
      tracks: 0,
      videos: 0,
      authors: 0
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus({
      isImporting: true,
      success: false,
      error: null,
      stats: { tracks: 0, videos: 0, authors: 0 }
    });

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid JSON format: missing data array');
      }

      const stats = await importBrowseAiData(data.data, {
        onLog: (entry) => {
          console.log('Import progress:', entry);
          // You can add additional logging UI here if needed
        }
      });

      setStatus({
        isImporting: false,
        success: true,
        error: null,
        stats
      });
    } catch (error) {
      setStatus({
        isImporting: false,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import data',
        stats: { tracks: 0, videos: 0, authors: 0 }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-surface-secondary hover:bg-surface/80 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-text-secondary" />
            <p className="mb-2 text-sm text-text-primary">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-text-secondary">JSON file from Browse.ai bulk export</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".json"
            onChange={handleFileUpload}
            disabled={status.isImporting}
          />
        </label>
      </div>

      <JsonParsingLog 
        isActive={status.isImporting}
        onComplete={() => {
          // Handle completion if needed
        }}
      />
    </div>
  );
}