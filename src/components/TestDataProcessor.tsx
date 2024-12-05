import { useState } from 'react';
import { Play, Copy, Check, Loader } from 'lucide-react';
import { bulkRunProcessor } from '../services/hot50-videos/bulk-run-processor';
import { loggingService } from '../services/logging';

const DEFAULT_TEST_DATA = {
  "id": "a79ca9ee-a5f2-4061-ae09-14daadb56f5d",
  "status": "successful",
  "inputParameters": {
    "originUrl": "https://www.tiktok.com/music/Ma%20Baby-7430864219010566145?mc_id=6678961649233169157&mc_name=DE-Hot-50",
    "tiktok_videos_limit": 15
  },
  "capturedLists": {
    "TikTok Videos": [{
      "Position": "1",
      "Username": "jazeek99",
      "Video Link": "https://www.tiktok.com/@jazeek99/video/7438979070957817121",
      "Thumbnail Image": "https://p16-sign-useast2a.tiktokcdn.com/obj/tos-useast2a-p-0037-euttp/oQfn1lRYENDPi8HEhkF1hQXBDyfTQQBrIhDPQA",
      "Profile Link": "https://www.tiktok.com/@jazeek99?lang=en",
      "Profile Picture": "https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-avt-0068c001-no/004a84c1cf6a722b592396dd67f0c458"
    }]
  }
};

export function TestDataProcessor() {
  const [testData, setTestData] = useState(JSON.stringify(DEFAULT_TEST_DATA, null, 2));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      const data = JSON.parse(testData);

      // Wrap the test data in the expected format
      const wrappedData = {
        result: {
          robotTasks: {
            items: [data]
          }
        }
      };

      loggingService.addLog({
        type: 'info',
        message: 'Starting to process test data',
        data: wrappedData
      });

      await bulkRunProcessor.processData(wrappedData);
    } catch (error) {
      loggingService.addLog({
        type: 'error',
        message: 'Failed to process test data',
        data: error
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(testData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-medium text-text-primary mb-4">Test Data Processor</h3>
      
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            placeholder="Paste Browse.ai task data here..."
            className="w-full h-96 px-4 py-3 bg-surface-secondary rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-cream font-mono text-sm"
            disabled={isProcessing}
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-surface rounded hover:bg-surface-secondary transition-colors"
            title="Copy to clipboard"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-text-secondary" />
            )}
          </button>
        </div>

        <button
          onClick={handleProcess}
          disabled={isProcessing || !testData.trim()}
          className="w-full px-4 py-2 bg-cream text-stone-dark rounded-lg hover:bg-cream-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Process Test Data</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}