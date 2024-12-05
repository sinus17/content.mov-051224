import { BrowseAiClient } from './browse-ai/client';
import { BrowseAiConfig } from '../types/browse-ai';

const config: BrowseAiConfig = {
  apiKey: '43e0d1f1-da8d-491a-bb49-8885c9589725:9bbd8e0c-8008-423d-b63d-fcf2d24bc22c',
  teamId: 'aa33ff17-1113-4147-a046-ca655dd36695',
  robotId: '51fcf5df-61fd-4ea7-9f2d-2b2eb44918a2'
};

export const browseAiClient = new BrowseAiClient(config);