import { useState } from 'react';
import { RefreshCw, Key, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { tikTokAuth } from '../services/tiktok/auth';
import { loggingService } from '../services/logging';

export function TikTokApiSection() {
  const [isChecking, setIsChecking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<{
    isValid: boolean;
    error: string | null;
    lastChecked: Date | null;
    token: string | null;
  }>({
    isValid: false,
    error: null,
    lastChecked: null,
    token: null
  });

  const checkApiAccess = async () => {
    setIsChecking(true);
    try {
      const token = await tikTokAuth.getAccessToken();
      setStatus({
        isValid: true,
        error: null,
        lastChecked: new Date(),
        token
      });
      
      loggingService.addLog({
        type: 'success',
        message: 'Successfully verified TikTok API access',
        data: { tokenExpiry: tikTokAuth.getTokenExpiry() }
      });
    } catch (error) {
      setStatus({
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to verify API access',
        lastChecked: new Date(),
        token: null
      });

      loggingService.addLog({
        type: 'error',
        message: 'Failed to verify TikTok API access',
        data: error
      });
    } finally {
      setIsChecking(false);
    }
  };

  const generateNewToken = async () => {
    setIsGenerating(true);
    try {
      await tikTokAuth.clearToken();
      const token = await tikTokAuth.getAccessToken();
      setStatus({
        isValid: true,
        error: null,
        lastChecked: new Date(),
        token
      });

      loggingService.addLog({
        type: 'success',
        message: 'Generated new TikTok API token',
        data: { tokenExpiry: tikTokAuth.getTokenExpiry() }
      });
    } catch (error) {
      setStatus({
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to generate new token',
        lastChecked: new Date(),
        token: null
      });

      loggingService.addLog({
        type: 'error',
        message: 'Failed to generate new TikTok API token',
        data: error
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Key className="w-5 h-5 text-cream" />
          <h3 className="text-lg font-medium text-text-primary">TikTok API Access</h3>
        </div>
        <button
          onClick={checkApiAccess}
          disabled={isChecking || isGenerating}
          className="p-2 hover:bg-surface-secondary rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-text-secondary ${isChecking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {isChecking ? (
            <Loader className="w-4 h-4 animate-spin text-cream" />
          ) : status.isValid ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          <span className={status.isValid ? "text-green-500" : "text-red-500"}>
            {status.isValid ? 'API Access Valid' : 'API Access Invalid'}
          </span>
        </div>

        {status.error && (
          <div className="bg-surface-secondary rounded-lg p-3">
            <p className="text-sm text-red-400">{status.error}</p>
          </div>
        )}

        {status.lastChecked && (
          <p className="text-sm text-text-secondary">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </p>
        )}

        {status.token && (
          <div className="bg-surface-secondary rounded-lg p-3">
            <p className="text-sm text-text-secondary break-all">
              Current token: {status.token}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Expires: {tikTokAuth.getTokenExpiry()?.toLocaleString()}
            </p>
          </div>
        )}

        <button
          onClick={generateNewToken}
          disabled={isGenerating || isChecking}
          className="w-full px-4 py-2 bg-cream text-stone-dark rounded-lg hover:bg-cream-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Generating Token...</span>
            </>
          ) : (
            <>
              <Key className="w-4 h-4" />
              <span>Generate New Token</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}